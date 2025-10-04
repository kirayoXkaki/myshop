"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const prisma = new client_1.PrismaClient();
let AuthService = class AuthService {
    jwt;
    constructor(jwt) {
        this.jwt = jwt;
    }
    async issueTokens(user) {
        const jti = (0, crypto_1.randomUUID)();
        const now = new Date();
        const refreshDays = 7;
        const refreshExp = new Date(now.getTime() + refreshDays * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
            data: {
                id: jti,
                userId: user.id,
                expiresAt: refreshExp,
            },
        });
        const access_token = await this.jwt.signAsync({ sub: user.id, email: user.email }, { expiresIn: '15m', secret: process.env.JWT_SECRET });
        const refresh_token = await this.jwt.signAsync({ sub: user.id, jti }, { expiresIn: '7d', secret: process.env.JWT_SECRET });
        return { access_token, refresh_token };
    }
    async register(email, password) {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists)
            throw new common_1.UnauthorizedException('Email already registered');
        const passwordHash = await argon2.hash(password);
        const user = await prisma.user.create({ data: { email, passwordHash } });
        const tokens = await this.issueTokens(user);
        return { user: { id: user.id, email: user.email }, ...tokens };
    }
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = await this.issueTokens(user);
        return { user: { id: user.id, email: user.email }, ...tokens };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const jti = payload?.jti;
        const userId = payload?.sub;
        if (!jti || !userId)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const record = await prisma.refreshToken.findUnique({ where: { id: jti } });
        if (!record || record.userId !== userId || record.revoked) {
            throw new common_1.UnauthorizedException('Refresh token revoked or not found');
        }
        if (new Date(record.expiresAt).getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        await prisma.refreshToken.update({ where: { id: jti }, data: { revoked: true } });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const tokens = await this.issueTokens(user);
        return { user: { id: user.id, email: user.email }, ...tokens };
    }
    async logout(refreshToken) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const jti = payload?.jti;
        if (!jti)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await prisma.refreshToken.updateMany({
            where: { id: jti, revoked: false },
            data: { revoked: true },
        });
        return { ok: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map