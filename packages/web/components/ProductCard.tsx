"use client";

import { useCart, fmtCents } from "@/lib/cart";

type Props = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  stock: number;
};

export default function ProductCard(p: Props) {
  const add = useCart((s) => s.addItem);
  const canBuy = p.stock > 0;

  return (
    <article className="rounded-xl border p-4 shadow-sm">
      <h2 className="font-semibold mb-1">{p.title}</h2>
      <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold">{fmtCents(p.priceCents)}</span>
        <span className="text-xs text-gray-500">库存：{p.stock}</span>
      </div>
      <button
        disabled={!canBuy}
        onClick={() =>
          add({ productId: p.id, title: p.title, priceCents: p.priceCents }, 1)
        }
        className={`mt-3 w-full rounded px-3 py-2 text-white ${
          canBuy ? "bg-blue-600 hover:opacity-90" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {canBuy ? "加入购物车" : "暂时缺货"}
      </button>
    </article>
  );
}
