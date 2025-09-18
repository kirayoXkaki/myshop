import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(userId?: string): Promise<({
        payment: {
            id: string;
            createdAt: Date;
            status: string;
            orderId: string;
            provider: string;
            providerRef: string;
            amountCents: number;
            raw: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        items: ({
            product: {
                id: string;
                title: string;
                priceCents: number;
            };
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            productId: string;
            qty: number;
            unitCents: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        totalCents: number;
        userId: string;
    })[]>;
}
