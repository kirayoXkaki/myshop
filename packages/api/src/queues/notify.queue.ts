import { Queue, JobsOptions } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const QUEUE_NAME = 'order-notify';
export const JOB_NAME = 'send-order-notification';

const notifyQueue = new Queue(QUEUE_NAME, { connection: { url: REDIS_URL } });

export async function enqueueOrderNotification(input: {
  orderId: string;
  email?: string;
  items: Array<{ productId: string; qty: number }>;
  jobId?: string; // 可用 Stripe session.id 幂等
}) {
  const opts: JobsOptions = {
    jobId: input.jobId,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false
  };
  return notifyQueue.add(JOB_NAME, input, opts);
}
