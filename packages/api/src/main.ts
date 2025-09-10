import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

//   app.use(
//   '/payments/webhook',
//   express.json({
//     verify: (req: any, _res, buf) => {
//       req.rawBody = buf;
//     },
//   }),
// );//影响其他route不适用

  app.use('/payments/webhook', raw({ type: 'application/json' }));

  // 端口改为 3001（默认是 3000）
  await app.listen(3001);

  console.log('API listening at http://localhost:3001'); // 方便你验证

  // const shutdown = async (signal?: string) => {
  //   try {
  //     console.log(`[shutdown] signal=${signal} closing app...`);
  //     await app.close();        // 释放端口/连接
  //   } finally {
  //     process.exit(0);
  //   }
  // };

  // ['SIGINT', 'SIGTERM', 'SIGUSR2', 'SIGHUP'].forEach(sig =>
  //   process.on(sig as NodeJS.Signals, () => shutdown(sig))
  // );

  // // 兜底：进程将退出时
  // process.on('beforeExit', () => shutdown('beforeExit'));
}
bootstrap();
