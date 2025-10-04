"use client";

import { useState } from "react";
import StatusTag from "@/components/StatusTag";

export type OrderItem = {
  productId: string;
  qty: number;
  unitCents: number;
  product?: { title: string } | null;
};
export type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalCents: number;
  items: OrderItem[];
};

const fmt = (c: number) => `¥${(c/100).toFixed(2)}`;

export default function OrderCard({ o }: { o: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold truncate">订单号：{o.id}</div>
          <div className="text-sm text-gray-500">
            创建时间：{new Date(o.createdAt).toLocaleString()}
          </div>
          <div className="mt-1"><StatusTag status={o.status} /></div>
        </div>
        <div className="text-lg font-bold">{fmt(o.totalCents)}</div>
        <button
          className="text-sm underline shrink-0"
          onClick={() => setOpen(!open)}
        >
          {open ? "收起明细" : "查看明细"}
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t pt-3 space-y-1">
          {o.items.map((it, idx) => (
            <div key={idx} className="text-sm flex justify-between">
              <span className="truncate">
                {it.product?.title ?? it.productId} × {it.qty}
              </span>
              <span>{fmt(it.unitCents)}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
