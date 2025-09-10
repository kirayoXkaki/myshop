import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users') // ① 基础路由前缀：/users
export class UsersController {
  constructor(private readonly usersService: UsersService) {} // ② 注入 Service

  @Get() // ③ GET /users → 列表
  async list() {
    return this.usersService.findAll();
  }

  @Post() // ④ POST /users → 创建
  async create(@Body() body: { email: string; password: string }) {
    // 简单的参数检查（演示用；生产应使用 class-validator）
    if (!body?.email || !body?.password) {
      return { error: 'email 和 password 不能为空' };
    }
    return this.usersService.create(body);
  }
}
