"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_NAME = exports.QUEUE_NAME = void 0;
exports.enqueueOrderNotification = enqueueOrderNotification;
const bullmq_1 = require("bullmq");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.QUEUE_NAME = 'order-notify';
exports.JOB_NAME = 'send-order-notification';
const notifyQueue = new bullmq_1.Queue(exports.QUEUE_NAME, { connection: { url: REDIS_URL } });
async function enqueueOrderNotification(input) {
    const opts = {
        jobId: input.jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false
    };
    return notifyQueue.add(exports.JOB_NAME, input, opts);
}
//# sourceMappingURL=notify.queue.js.map