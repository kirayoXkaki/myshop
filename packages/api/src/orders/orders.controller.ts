import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders') // ① 路由前缀：/orders
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {} // ② 注入 service

  @Get()
  async list(@Query('userId') userId?: string) {
    // ③ 暂时用 query 传 userId（后续接入登录改为从 token 里读）
    const uid = userId || 'anonymous'; // ④ 没传则默认 anonymous（便于你立即验证）
    return this.ordersService.findByUser(uid);
  }
}
