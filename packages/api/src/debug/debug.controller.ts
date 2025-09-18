import { Body, Controller, Post } from '@nestjs/common';
import { enqueueOrderNotification } from '../queues/notify.queue';

@Controller('debug')
export class DebugController {
  @Post('notify')
  async notify(@Body() body: { orderId: string; email?: string }) {
    if (!body?.orderId) return { error: 'orderId required' };
    const job = await enqueueOrderNotification({
      orderId: body.orderId,
      email: body.email ?? 'me@example.com',
      items: [{ productId: 'demo', qty: 1 }]
    });
    return { enqueued: true, jobId: job.id };
  }
}
