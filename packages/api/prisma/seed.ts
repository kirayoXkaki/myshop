// ① 引入 PrismaClient，用于连接数据库
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ② 批量插入 3 个商品（跳过重复，防止多次跑报错）
  await prisma.product.createMany({
    data: [
      { title: '有线耳机', description: '入门款', priceCents: 2999, stock: 100 },
      { title: '蓝牙耳机', description: '降噪',   priceCents: 12999, stock: 50  },
      { title: '机械键盘', description: '青轴',   priceCents: 49900, stock: 20  },
    ],
    skipDuplicates: true,
  });

  console.log('Seed products done ✅'); // ③ 控制台提示
}

// ④ 标准的执行/回收模板
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
