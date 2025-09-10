export declare class PaymentsController {
    create(dto: {
        items: {
            productId: string;
            qty: number;
        }[];
        success_url: string;
        cancel_url: string;
    }): Promise<{
        id: string;
        url: string | null;
    }>;
    webhook(req: any, sig: string): Promise<{
        received: boolean;
        error: string;
        duplicate?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        error?: undefined;
        duplicate?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        duplicate: boolean;
        error?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        idempotent: boolean;
        error?: undefined;
        duplicate?: undefined;
    }>;
}
