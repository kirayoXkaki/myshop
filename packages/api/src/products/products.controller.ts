import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list() {
    const r = await this.products.findAll();
    return r.data; // ✅ 只把数组返回给前端
  }
}
