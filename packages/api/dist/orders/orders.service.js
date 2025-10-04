"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OrdersService {
    async findByUserPaged(userId, page, pageSize) {
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
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map