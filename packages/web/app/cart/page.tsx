"use client";

import Link from "next/link";
import { useCart, fmtCents } from "@/lib/cart";
import { API_BASE } from "@/lib/api";
import { authFetch } from "@/lib/authFetch";
import { useState } from "react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.totalCents);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const hasItems = items.length > 0;

  async function handleCheckout() {
    if (!hasItems || submitting) return;
    setSubmitting(true);
    try {
      // 1) 组装后端需要的 items
      const payload = {
        items: items.map(({ productId, qty }) => ({ productId, qty })),
        success_url: "http://localhost:3000/checkout/success",
        cancel_url: "http://localhost:3000/checkout/cancel",
      };

      // 2) 调受保护接口（自动带 token）
      const res = await authFetch(`${API_BASE}/payments/create`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      // 3) 解析 { url } 并跳转到 Stripe Checkout
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout url returned");
      }
    } catch (e: any) {
      alert(`下单失败：${e.message || e}`);
      setSubmitting(false);
    }
  }

  return (
    <main className="py-6 space-y-4">
      <h1 className="text-2xl font-bold">购物车</h1>

      {!hasItems && (
        <p className="text-gray-600">
          购物车为空，去 <Link className="underline" href="/products">逛逛商品</Link> 吧～
        </p>
      )}

      {hasItems && (
        <>
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.productId} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.title}</div>
                  <div className="text-sm text-gray-500">{fmtCents(it.priceCents)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => updateQty(it.productId, Math.max(1, it.qty - 1))}
                  >-</button>
                  <input
                    className="w-12 text-center border rounded py-1"
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) => updateQty(it.productId, Math.max(1, Number(e.target.value)))}
                  />
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => updateQty(it.productId, it.qty + 1)}
                  >+</button>
                </div>
                <div className="w-24 text-right font-semibold">
                  {fmtCents(it.qty * it.priceCents)}
                </div>
                <button className="text-red-600 underline" onClick={() => remove(it.productId)}>
                  删除
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t pt-4">
            <button className="text-sm text-gray-600 underline" onClick={clear}>清空购物车</button>
            <div className="text-lg font-bold">合计：{fmtCents(total)}</div>
          </div>

          {/* 真正的结账按钮 */}
          <div className="pt-2">
            <button
              onClick={handleCheckout}
              disabled={!hasItems || submitting}
              className={`inline-block px-4 py-2 rounded text-white ${submitting ? "bg-gray-400" : "bg-green-600 hover:opacity-90"}`}
            >
              {submitting ? "创建结账会话…" : "去结账"}
            </button>
          </div>

          {/* 调试：看看即将提交的 payload */}
          <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {JSON.stringify(items.map(({ productId, qty }) => ({ productId, qty })), null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
