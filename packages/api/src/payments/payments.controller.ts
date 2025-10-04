import { Body, Controller, Headers, Post, Req,UseGuards } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { enqueueOrderNotification } from '../queues/notify.queue';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth} from '@nestjs/swagger';

const prisma = new PrismaClient(); // 这步暂时没用到，后续落库会用
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

@ApiBearerAuth('access-token') 
@Controller('payments')
export class PaymentsController {
    // 创建支付会话：接受 items，返回 Stripe Checkout 的 url
    //   @Post('create')
    //   async create(@Body() dto: any) {
    //   console.log('[payments/create] body =', dto);
    //   // ...
    // }
    @UseGuards(JwtAuthGuard)
    @Post('create')
    async create(@Req() req: any,@Body() dto: CreateSessionDto) {
        const userId = req.user.userId; 
        const email =req.user.email ?? '';
        // 1) 查数据库拿价格（服务端定价，避免前端篡改）
        const ids = dto.items.map(i => i.productId);
        const products = await prisma.product.findMany({ where: { id: { in: ids } } });

        const line_items = products.map(p => {
            const qty = dto.items.find(i => i.productId === p.id)!.qty;
            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: p.title },
                    unit_amount: p.priceCents,
                },
                quantity: qty,
            };
        });

        // 2) 创建 Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,
            success_url: dto.success_url,
            cancel_url: dto.cancel_url,
            metadata: {
                itemsJson: JSON.stringify(dto.items), // [{productId, qty}, ...]
                userId, 
                email,
            },
        });

        return { id: session.id, url: session.url };
    }

    // Webhook：Stripe 回调我们（用来确认支付状态）
    @Post('webhook')
    async webhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (e: any) {
            console.error('[webhook] signature error:', e.message);
            return { received: false, error: 'bad signature' };
        }

        if (event.type !== 'checkout.session.completed') {
            return { received: true }; // 忽略其他事件
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const metaUserId = session.metadata?.userId || 'anonymous';

        // ---------- 幂等：若已处理过则直接返回 ----------
        const provider = 'stripe';
        const providerRef = session.id;
        const existed = await prisma.payment.findFirst({ where: { provider, providerRef } });
        if (existed) {
            console.log('🟡 webhook duplicate, skip:', providerRef);
            return { received: true, duplicate: true };
        }

        // ---------- 解析 metadata 里的购物车 ----------
        let items: { productId: string; qty: number }[] = [];
        try {
            const itemsJson = (session.metadata?.itemsJson as string) || '[]';
            items = JSON.parse(itemsJson);
        } catch {
            console.error('[webhook] invalid itemsJson, session=', session.id);
            return { received: false, error: 'invalid metadata.itemsJson' };
        }
        if (!Array.isArray(items) || items.length === 0) {
            console.error('[webhook] empty items, session=', session.id);
            return { received: false, error: 'empty items' };
        }

        // ---------- 查库、计算总价 ----------
        const idToQty = new Map<string, number>();
        for (const it of items) {
            const q = Number(it?.qty || 0);
            if (!it?.productId || !Number.isFinite(q) || q <= 0) {
                return { received: false, error: `bad item ${JSON.stringify(it)}` };
            }
            idToQty.set(it.productId, (idToQty.get(it.productId) || 0) + q);
        }
        const ids = [...idToQty.keys()];
        const products = await prisma.product.findMany({ where: { id: { in: ids } } });
        if (products.length !== ids.length) {
            const found = new Set(products.map(p => p.id));
            const miss = ids.filter(id => !found.has(id));
            return { received: false, error: `missing products: ${miss.join(',')}` };
        }

        const orderItemsData = products.map(p => ({
            productId: p.id,
            qty: idToQty.get(p.id)!,
            unitCents: p.priceCents,
        }));
        const totalCents = orderItemsData.reduce((sum, oi) => sum + oi.unitCents * oi.qty, 0);

        let orderId: string;

        // ---------- 事务：建订单/明细/支付 + 扣库存 ----------
        try {
            orderId = await prisma.$transaction(async (tx) => {
                // 1) 创建订单（匿名用户示例：不关联合法 userId）
                const order = await tx.order.create({
                    data: {
                        userId: metaUserId ,      // 你可以改成真实 userId；先用固定值演示
                        totalCents,
                        status: 'PAID',
                    },
                });

                // 2) 明细
                await tx.orderItem.createMany({
                    data: orderItemsData.map(oi => ({
                        orderId: order.id,
                        productId: oi.productId,
                        qty: oi.qty,
                        unitCents: oi.unitCents,
                    })),
                });

                // 3) 扣库存（防止超卖：这里示例做“非负检查”）
                for (const oi of orderItemsData) {
                    const updated = await tx.product.update({
                        where: { id: oi.productId },
                        data: { stock: { decrement: oi.qty } },
                    });
                    if (updated.stock < 0) {
                        throw new Error(`stock negative for product ${oi.productId}`);
                    }
                }

                // 4) 支付记录（幂等索引保证不会重复）
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        provider,
                        providerRef,
                        amountCents: totalCents,
                        status: 'SUCCEEDED',
                        raw: event as any,
                    },
                });

                console.log('✅ order created:', order.id, 'total=', totalCents);
                return order.id;
            });
        } catch (e: any) {
            // 如果并发触发，可能因 @@unique(provider,providerRef) 冲突而失败 → 视为幂等成功
            if (e.code === 'P2002') {
                console.log('🟡 unique conflict but safe (idempotent). ref=', providerRef);
                return { received: true, idempotent: true };
            }
            console.error('[webhook tx] error:', e?.message || e);
            return { received: false, error: 'tx failed' };
        }

        await enqueueOrderNotification({
            orderId: orderId,
            email: 'anon@example.com', // TODO: 接入登录后替换为真实邮箱
            items: orderItemsData.map(({ productId, qty }) => ({ productId, qty })),
            jobId: providerRef // 如：session.id，避免 Stripe 重试导致重复入队
            });

        return { received: true };
    }

}
