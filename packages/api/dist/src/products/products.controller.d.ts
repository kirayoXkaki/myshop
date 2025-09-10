import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(): Promise<{
        fromCache: boolean;
        data: any;
    }>;
}
