export declare class ProductsService {
    findAll(): Promise<{
        fromCache: boolean;
        data: any;
    }>;
}
