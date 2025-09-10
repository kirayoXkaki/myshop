"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const redis_1 = require("../cache/redis");
const prisma = new client_1.PrismaClient();
const CACHE_KEY = 'cache:products:all';
const TTL_SECONDS = 10;
let ProductsService = class ProductsService {
    async findAll() {
        const cached = await redis_1.redis.get(CACHE_KEY);
        if (cached) {
            return { fromCache: true, data: JSON.parse(cached) };
        }
        const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
        await redis_1.redis.setex(CACHE_KEY, TTL_SECONDS, JSON.stringify(rows));
        return { fromCache: false, data: rows };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)()
], ProductsService);
//# sourceMappingURL=products.service.js.map