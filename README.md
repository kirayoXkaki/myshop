# 🛒 MyShop — Fullstack E-commerce (Monorepo)

A learning project for building an e-commerce web app with payments, built using **NestJS + Prisma + PostgreSQL (pgvector) + Stripe + Redis (BullMQ)**.

* * *

## 📦 Project Structure

    myshop/
    ├── pnpm-workspace.yaml        # Monorepo config
    ├── packages/
    │   └── api/                   # NestJS backend API
    │       ├── prisma/            # Prisma schema & migrations
    │       ├── src/
    │       │   ├── products/      # ProductsController + Service
    │       │   ├── payments/      # Stripe checkout + webhook
    │       │   ├── orders/        # OrdersController + Service
    │       │   └── users/         # UsersController + Service
    │       └── ...
    ├── docker-compose.yml          # Postgres + Redis services
    └── .env                        # Environment variables

* * *

## 🚀 Features Implemented

* **Database**
  
  * `User`, `Product`, `Order`, `OrderItem`, `Payment` models
  * Relations: User–Order, Order–OrderItem, OrderItem–Product, Order–Payment
* **Payments (Stripe)**
  
  * `POST /payments/create` → creates Checkout Session
  * `POST /payments/webhook` → handles `checkout.session.completed` events
  * Metadata carries shopping cart info (`itemsJson`)
  * **幂等保证**：双层机制 (code check + `@@unique(provider,providerRef)`)
* **Orders**
  
  * `GET /orders?userId=anonymous` → query order history with items & payment info
  * Includes Prisma `include` relations
* **Products**
  
  * `GET /products` → list available products
* **Redis**
  
  * Connected via `ioredis`
  * Prepared for BullMQ background jobs (async notifications)

* * *

## ⚙️ Requirements

* Node.js 20+
* pnpm 9+
* Docker & Docker Compose
* Stripe CLI (for local webhook forwarding)

* * *

## 🛠️ Setup

    # 1. Install deps
    pnpm install
    
    # 2. Start DB + Redis
    docker compose up -d
    
    # 3. Apply migrations
    pnpm --filter api exec prisma migrate dev
    
    # 4. Start API
    pnpm --filter api run start:dev

* * *

## 🔑 Environment Variables (`.env`)

    # Database
    DATABASE_URL=postgresql://app:app@localhost:5432/shop
    
    # Redis
    REDIS_URL=redis://localhost:6379
    
    # Stripe
    STRIPE_SECRET_KEY=sk_test_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx
    
    # Others
    WEB_BASE=http://localhost:3000
    API_BASE=http://localhost:3001
    JWT_SECRET=replace_with_strong_secret
    OPENAI_API_KEY=sk-xxx

* * *

## 🧪 Testing Payment Flow

1. Start local API (`pnpm --filter api run start:dev`)
  
2. Start Stripe forwarding:
  
      stripe listen --forward-to localhost:3001/payments/webhook
  
3. Create checkout session:
  
      curl -X POST http://localhost:3001/payments/create      -H 'Content-Type: application/json'      -d '{"items":[{"productId":"<REAL_ID>","qty":1}],
             "success_url":"http://localhost:3000/success",
             "cancel_url":"http://localhost:3000/cancel"}'
  
4. Open returned `url` and pay with test card `4242 4242 4242 4242`.
  
5. Verify order written into DB and visible via:
  
      curl http://localhost:3001/orders?userId=anonymous
  

* * *

## 📌 Next Steps

* 3.8.2: Integrate BullMQ workers → async tasks (e.g., email notifications)
* Add user authentication (JWT) → bind orders to real users
* Frontend app in `packages/web` (Next.js/React)

* * *

#
