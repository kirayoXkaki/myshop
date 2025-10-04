// src/types/express.d.ts
export {}; // make this file a module

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;        // match what your JwtStrategy.validate returns
      email?: string;
      role?: string;
    };
  }
}
