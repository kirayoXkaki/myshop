import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class OrdersService {
  async findByUserPaged(userId: string, page: number, pageSize: number) {
    const take = Math.min(50, Math.max(1, pageSize));
    const skip = Math.max(0, (page - 1) * take);

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          items: { include: { product: { select: { title: true } } } },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { rows, total };
  }
}
