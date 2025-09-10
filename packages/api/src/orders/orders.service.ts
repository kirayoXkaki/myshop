import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // ① 连接数据库

@Injectable()
export class OrdersService {
  // ② 根据 userId 查订单，按创建时间倒序
  async findByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },                 // ③ 过滤条件：只看这个用户的订单
      orderBy: { createdAt: 'desc' },    // ④ 新订单在前
      include: {
        items: {                         // ⑤ include 订单明细
          include: {
            product: {                   // ⑥ 明细里再把商品信息一并取出
              select: {                  // ⑦ 只取关键字段（避免过多无用字段）
                id: true,
                title: true,
                priceCents: true,
              },
            },
          },
        },
        payment: true,                   // ⑧ 同时把支付记录也带上
      },
    });
  }
}
