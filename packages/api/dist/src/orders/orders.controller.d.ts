import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(userId?: string): Promise<({
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
        payment: {
            id: string;
            status: string;
            createdAt: Date;
            orderId: string;
            provider: string;
            providerRef: string;
            amountCents: number;
            raw: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    } & {
        id: string;
        userId: string;
        totalCents: number;
        status: string;
        createdAt: Date;
    })[]>;
}
