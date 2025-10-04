"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { authFetch } from "@/lib/authFetch";
import OrderCard, { Order } from "@/components/OrderCard";

type OrdersResp = { data: Order[]; total: number; page: number; pageSize: number };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(true);

  async function load(p = 1) {
    setLoading(true);
    const res = await authFetch(`${API_BASE}/orders?page=${p}&pageSize=${pageSize}`);
    const json = (await res.json()) as OrdersResp;
    setOrders(json.data);
    setTotal(json.total);
    setPage(json.page);
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <Link href="/products" className="text-sm text-blue-600 underline">返回商品</Link>
      </header>

      {loading && <p className="text-gray-600">加载中…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-gray-600">暂无订单，去 <Link className="underline" href="/products">选购</Link> 吧～</p>
      )}

      {!loading && orders.length > 0 && (
        <>
          <ul className="space-y-3">{orders.map(o => <OrderCard key={o.id} o={o} />)}</ul>

          {/* 分页器 */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
            >上一页</button>

            <span className="text-sm text-gray-600">
              第 <b>{page}</b> / {pages} 页（共 {total} 条）
            </span>

            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page >= pages}
              onClick={() => load(page + 1)}
            >下一页</button>
          </div>
        </>
      )}
    </main>
  );
}
