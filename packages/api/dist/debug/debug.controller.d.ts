export declare class DebugController {
    notify(body: {
        orderId: string;
        email?: string;
    }): Promise<{
        error: string;
        enqueued?: undefined;
        jobId?: undefined;
    } | {
        enqueued: boolean;
        jobId: string | undefined;
        error?: undefined;
    }>;
}
