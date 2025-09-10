"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.product.createMany({
        data: [
            { title: '有线耳机', description: '入门款', priceCents: 2999, stock: 100 },
            { title: '蓝牙耳机', description: '降噪', priceCents: 12999, stock: 50 },
            { title: '机械键盘', description: '青轴', priceCents: 49900, stock: 20 },
        ],
        skipDuplicates: true,
    });
    console.log('Seed products done ✅');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map