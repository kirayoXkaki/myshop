"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  title: string;
  priceCents: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  // 计算属性
//   count: number;
//   totalCents: number;
  // 操作
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
    //   get count() {
    //     return get().items.reduce((n, it) => n + it.qty, 0);
    //   },
    //   get totalCents() {
    //     return get().items.reduce((s, it) => s + it.qty * it.priceCents, 0);
    //   },
      addItem(item, qty = 1) {
        const { items } = get();
        const i = items.findIndex((x) => x.productId === item.productId);
        if (i >= 0) {
          const next = [...items];
          next[i] = { ...next[i], qty: next[i].qty + qty };
          set({ items: next });
        } else {
          set({ items: [...items, { ...item, qty }] });
        }
      },
      removeItem(productId) {
        set({ items: get().items.filter((x) => x.productId !== productId) });
      },
      updateQty(productId, qty) {
        if (qty <= 0) return;
        set({
          items: get().items.map((x) =>
            x.productId === productId ? { ...x, qty } : x
          ),
        });
      },
      clear() {
        set({ items: [] });
      },
    }),
    { name: "myshop-cart-v1" } // localStorage key
  )
);

export const fmtCents = (c: number) => `¥${(c / 100).toFixed(2)}`;
