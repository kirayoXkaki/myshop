"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type OrderItem = {
  productId: string;
  qty: number;
  unitCents: number;
  product?: { title: string } | null;
};
type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalCents: number;
  items: OrderItem[];
};

function fmtCents(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

export default function SuccessPage() {
  const clear = useCart((s) => s.clear);
  const [latest, setLatest] = useState<Order | null>(null);
  const [phase, setPhase] = useState<"init"|"polling"|"done"|"timeout">("init");

  useEffect(() => {
    // ① 成功页：清空购物车（防重复）
    clear();

    // ② 未登录就不轮询（但一般到这一步用户已登录）
    if (!getAccessToken()) {
      setPhase("done");
      return;
    }

    // ③ 轮询最近订单：最多尝试 6 次，每 2 秒一次（总 12 秒）
    setPhase("polling");
    let count = 0;
    const timer = setInterval(async () => {
      count++;
      try {
        const list = await api<Order[]>("/orders"); // 已登录时会自动带 token（见你的 api.ts）
        // 假设后端 /orders 已按 createdAt desc 返回
        const first = list?.[0] ?? null;
        if (first) {
          setLatest(first);
          // 如果你希望“只要有订单就停”，可以在这里 clearInterval
          // 若想等到特定状态（如 PAID），也可以判断 first.status === 'PAID'
          setPhase("done");
          clearInterval(timer);
        } else if (count >= 6) {
          setPhase("timeout");
          clearInterval(timer);
        }
      } catch {
        // 出错也继续重试，直到次数耗尽
        if (count >= 6) {
          setPhase("timeout");
          clearInterval(timer);
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [clear]);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-green-600">支付成功 ✅</h1>
      <p className="text-gray-700">我们正在为你创建订单，请稍候。</p>

      {phase === "polling" && (
        <div className="text-sm text-gray-600">同步中…（会自动刷新）</div>
      )}

      {phase === "timeout" && (
        <div className="text-sm text-yellow-700">
          系统还在处理你的订单（可能是支付回调稍有延迟）。稍后去
          <Link href="/orders" className="underline"> 我的订单 </Link>查看。
        </div>
      )}

      {latest && (
        <section className="rounded-xl border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">订单号：{latest.id}</div>
              <div className="text-sm text-gray-500">
                创建时间：{new Date(latest.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">状态：{latest.status}</div>
            </div>
            <div className="text-lg font-bold">{fmtCents(latest.totalCents)}</div>
          </div>

          <div className="mt-3 border-t pt-3 space-y-1">
            {latest.items?.map((it, idx) => (
              <div key={idx} className="text-sm flex justify-between">
                <span className="truncate">
                  {it.product?.title ?? it.productId} × {it.qty}
                </span>
                <span>{fmtCents(it.unitCents)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-x-3">
        <Link href="/orders" className="underline">查看我的订单</Link>
        <Link href="/products" className="underline">继续购物</Link>
      </div>
    </main>
  );
}
