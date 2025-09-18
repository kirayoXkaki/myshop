"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./users/users.controller");
const users_service_1 = require("./users/users.service");
const products_controller_1 = require("./products/products.controller");
const products_service_1 = require("./products/products.service");
const payments_controller_1 = require("./payments/payments.controller");
const orders_controller_1 = require("./orders/orders.controller");
const orders_service_1 = require("./orders/orders.service");
const debug_controller_1 = require("./debug/debug.controller");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/env.validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validate: env_validation_1.validateEnv
            }),
        ],
        controllers: [users_controller_1.UsersController, products_controller_1.ProductsController, payments_controller_1.PaymentsController, orders_controller_1.OrdersController, debug_controller_1.DebugController],
        providers: [users_service_1.UsersService, products_service_1.ProductsService, orders_service_1.OrdersService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map