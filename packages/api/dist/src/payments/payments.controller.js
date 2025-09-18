"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const notify_queue_1 = require("../queues/notify.queue");
const create_session_dto_1 = require("./dto/create-session.dto");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
let PaymentsController = class PaymentsController {
    async create(dto) {
        const ids = dto.items.map(i => i.productId);
        const products = await prisma.product.findMany({ where: { id: { in: ids } } });
        const line_items = products.map(p => {
            const qty = dto.items.find(i => i.productId === p.id).qty;
            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: p.title },
                    unit_amount: p.priceCents,
                },
                quantity: qty,
            };
        });
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,
            success_url: dto.success_url,
            cancel_url: dto.cancel_url,
            metadata: {
                itemsJson: JSON.stringify(dto.items),
            },
        });
        return { id: session.id, url: session.url };
    }
    async webhook(req, sig) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (e) {
            console.error('[webhook] signature error:', e.message);
            return { received: false, error: 'bad signature' };
        }
        if (event.type !== 'checkout.session.completed') {
            return { received: true };
        }
        const session = event.data.object;
        const provider = 'stripe';
        const providerRef = session.id;
        const existed = await prisma.payment.findFirst({ where: { provider, providerRef } });
        if (existed) {
            console.log('🟡 webhook duplicate, skip:', providerRef);
            return { received: true, duplicate: true };
        }
        let items = [];
        try {
            const itemsJson = session.metadata?.itemsJson || '[]';
            items = JSON.parse(itemsJson);
        }
        catch {
            console.error('[webhook] invalid itemsJson, session=', session.id);
            return { received: false, error: 'invalid metadata.itemsJson' };
        }
        if (!Array.isArray(items) || items.length === 0) {
            console.error('[webhook] empty items, session=', session.id);
            return { received: false, error: 'empty items' };
        }
        const idToQty = new Map();
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
            qty: idToQty.get(p.id),
            unitCents: p.priceCents,
        }));
        const totalCents = orderItemsData.reduce((sum, oi) => sum + oi.unitCents * oi.qty, 0);
        let orderId;
        try {
            orderId = await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({
                    data: {
                        userId: 'cmf5onyqd0000yqlhlxm0okl3',
                        totalCents,
                        status: 'PAID',
                    },
                });
                await tx.orderItem.createMany({
                    data: orderItemsData.map(oi => ({
                        orderId: order.id,
                        productId: oi.productId,
                        qty: oi.qty,
                        unitCents: oi.unitCents,
                    })),
                });
                for (const oi of orderItemsData) {
                    const updated = await tx.product.update({
                        where: { id: oi.productId },
                        data: { stock: { decrement: oi.qty } },
                    });
                    if (updated.stock < 0) {
                        throw new Error(`stock negative for product ${oi.productId}`);
                    }
                }
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        provider,
                        providerRef,
                        amountCents: totalCents,
                        status: 'SUCCEEDED',
                        raw: event,
                    },
                });
                console.log('✅ order created:', order.id, 'total=', totalCents);
                return order.id;
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                console.log('🟡 unique conflict but safe (idempotent). ref=', providerRef);
                return { received: true, idempotent: true };
            }
            console.error('[webhook tx] error:', e?.message || e);
            return { received: false, error: 'tx failed' };
        }
        await (0, notify_queue_1.enqueueOrderNotification)({
            orderId: orderId,
            email: 'anon@example.com',
            items: orderItemsData.map(({ productId, qty }) => ({ productId, qty })),
            jobId: providerRef
        });
        return { received: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments')
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map