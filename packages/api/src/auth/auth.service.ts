import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  private async issueTokens(user: { id: string; email: string }) {
    const jti = randomUUID();
    const now = new Date();
    const refreshDays = 7; // 也可用 env 配置
    const refreshExp = new Date(now.getTime() + refreshDays * 24 * 60 * 60 * 1000);

    // 1) 记录 refresh 到数据库
    await prisma.refreshToken.create({
      data: {
        id: jti,
        userId: user.id,
        expiresAt: refreshExp,
      },
    });

    // 2) 签发 access（短）和 refresh（长，内含 jti）
    const access_token = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '15m', secret: process.env.JWT_SECRET } // 短效
    );

    const refresh_token = await this.jwt.signAsync(
      { sub: user.id, jti },
      { expiresIn: '7d', secret: process.env.JWT_SECRET } // 长效
    );

    return { access_token, refresh_token };
  }

  async register(email: string, password: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new UnauthorizedException('Email already registered');
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  async refresh(refreshToken: string) {
    // 1) 先校验签名 & 过期
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const jti = payload?.jti as string;
    const userId = payload?.sub as string;
    if (!jti || !userId) throw new UnauthorizedException('Invalid refresh token');

    // 2) 校验 DB 状态（没被吊销且未过期）
    const record = await prisma.refreshToken.findUnique({ where: { id: jti } });
    if (!record || record.userId !== userId || record.revoked) {
      throw new UnauthorizedException('Refresh token revoked or not found');
    }
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // 3) 旋转策略（可选）：用一次就吊销旧的，签发新的一对
    await prisma.refreshToken.update({ where: { id: jti }, data: { revoked: true } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  async logout(refreshToken: string) {
    // 校验 token 获取 jti
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const jti = payload?.jti as string;
    if (!jti) throw new UnauthorizedException('Invalid refresh token');

    // 吊销
    await prisma.refreshToken.updateMany({
      where: { id: jti, revoked: false },
      data: { revoked: true },
    });
    return { ok: true };
  }
}
