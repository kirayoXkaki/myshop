declare class CreateItemDto {
    productId: string;
    qty: number;
}
export declare class CreateSessionDto {
    items: CreateItemDto[];
    success_url: string;
    cancel_url: string;
}
export {};
