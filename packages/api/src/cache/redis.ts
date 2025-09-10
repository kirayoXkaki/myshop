// packages/api/src/cache/redis.ts
import Redis from 'ioredis';

// ① 读取环境变量（如果没配，就回退到本地默认）
const url = process.env.REDIS_URL || 'redis://localhost:6379';

// ② 创建全局可复用的 Redis 连接（建议单例）
export const redis = new Redis(url);

// ③ 打印一次连接状态，便于你确认连上
redis.on('ready', () => console.log('[redis] ready:', url));
redis.on('error', (e) => console.error('[redis] error:', e.message));
