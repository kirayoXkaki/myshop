import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 10;
    const { rows, total } = await this.orders.findByUserPaged(req.user.userId, p, ps);
    return { data: rows, total, page: p, pageSize: ps };
  }
}
