import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products') // ① 基础路由前缀：/products
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {} // ② 注入 service

  @Get() // ③ GET /products
  async list() {
    return this.productsService.findAll(); // ④ 调用 service
  }
}
