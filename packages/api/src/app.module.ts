import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { PaymentsController } from './payments/payments.controller';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { DebugController } from './debug/debug.controller'; 
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          // 全局可用
      envFilePath: '.env',     // 根目录 .env
      validate: validateEnv
      // ignoreEnvFile: false, // 若生产用系统环境变量，可改为 true
    }),
  ],
  controllers: [UsersController, ProductsController, PaymentsController, OrdersController,DebugController], // ← 确保有 ProductsController
  providers: [UsersService, ProductsService,OrdersService],         // ← 确保有 ProductsService
})
export class AppModule {}
