"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";



export default function Navbar() {
  const count = useCart(s => s.items.reduce((n, it) => n + it.qty, 0));
  const totalCents = useCart(s => s.items.reduce((sum, it) => sum + it.qty * it.priceCents, 0));
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
        <Link href="/" className="font-semibold">MyShop</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          <Link href="/orders">My Orders</Link>
          <Link href="/cart" className="font-medium">
            Cart ({count})
          </Link>
        </div>
      </div>
    </nav>
  );
}
