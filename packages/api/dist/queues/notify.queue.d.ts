export declare const QUEUE_NAME = "order-notify";
export declare const JOB_NAME = "send-order-notification";
export declare function enqueueOrderNotification(input: {
    orderId: string;
    email?: string;
    items: Array<{
        productId: string;
        qty: number;
    }>;
    jobId?: string;
}): Promise<import("bullmq").Job<any, any, string>>;
