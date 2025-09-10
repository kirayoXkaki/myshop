import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { redis } from '../cache/redis';     // ① 引入刚才的 redis 单例

const prisma = new PrismaClient();
const CACHE_KEY = 'cache:products:all';
const TTL_SECONDS = 10;  
// ① 创建 Prisma 客户端（供本 service 使用）


@Injectable()
export class ProductsService {
  // ② 返回所有商品，按创建时间倒序
  async findAll() {
    // ③ 读缓存
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return { fromCache: true, data: JSON.parse(cached) }; // ④ 命中缓存，直接返回
    }

    // ⑤ 未命中 → 查数据库
    const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

    // ⑥ 写缓存 + 过期时间
    await redis.setex(CACHE_KEY, TTL_SECONDS, JSON.stringify(rows));

    // ⑦ 返回结果，标记未命中
    return { fromCache: false, data: rows };
    }
}
