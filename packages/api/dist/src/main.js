"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use('/payments/webhook', (0, express_1.raw)({ type: 'application/json' }));
    await app.listen(3001);
    console.log('API listening at http://localhost:3001');
}
bootstrap();
//# sourceMappingURL=main.js.map