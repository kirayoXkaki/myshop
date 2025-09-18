"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
function validateEnv(env) {
    const required = [
        'DATABASE_URL',
        'REDIS_URL',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
    ];
    const missing = required.filter(k => !env[k] || String(env[k]).trim() === '');
    if (missing.length) {
        throw new Error('Missing required env: ' + missing.join(', '));
    }
    return env;
}
//# sourceMappingURL=env.validation.js.map