import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient(); // ① 创建 Prisma 客户端（连接数据库）

@Injectable()
export class UsersService {
  // ② 读取所有用户（按创建时间倒序）
  async findAll() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // ③ 创建用户：把明文密码做一个简单哈希后存到 passwordHash
  async create(input: { email: string; password: string }) {
    const hash = createHash('sha256').update(input.password).digest('hex'); // ❗示意
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: hash,
      },
      select: { id: true, email: true, createdAt: true }, // ④ 返回精简字段（不回传哈希）
    });
  }
}
