export declare class OrdersService {
    findByUserPaged(userId: string, page: number, pageSize: number): Promise<{
        rows: ({
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
    }>;
}
