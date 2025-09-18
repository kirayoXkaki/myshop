import { Worker, QueueEvents } from 'bullmq';

const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'order-notify';

// 事件流：方便观察任务完成/失败
new QueueEvents(QUEUE_NAME, { connection: { url: redisURL } })
  .on('completed', ({ jobId }) => console.log(`✅ Job done: ${jobId}`))
  .on('failed', ({ jobId, failedReason }) => console.error(`❌ Job fail: ${jobId} - ${failedReason}`));

// Worker 处理函数
new Worker(
  QUEUE_NAME,
  async (job) => {
    const { orderId, email, items } = job.data as { orderId: string; email?: string; items?: any[] };
    console.log(`📧 [worker] send confirmation for order=${orderId} to=${email ?? 'anon@example.com'} items=${items?.length ?? 0}`);
    // 模拟耗时
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true };
  },
  { connection: { url: redisURL } }
).on('ready', () => console.log(`[worker] ready on ${redisURL} queue=${QUEUE_NAME}`));
