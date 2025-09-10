import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { PaymentsController } from './payments/payments.controller';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';

@Module({
  imports: [],
  controllers: [UsersController, ProductsController, PaymentsController, OrdersController], // ← 确保有 ProductsController
  providers: [UsersService, ProductsService,OrdersService],         // ← 确保有 ProductsService
})
export class AppModule {}
