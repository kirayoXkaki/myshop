import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    list(req: any, page?: string, pageSize?: string): Promise<{
        data: ({
            items: ({
                product: {
                    title: string;
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
            userId: string;
            totalCents: number;
            status: string;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
