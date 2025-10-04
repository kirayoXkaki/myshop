export default function CancelPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-yellow-600">已取消付款</h1>
      <p>如果是误操作，你可以返回购物车重新尝试。</p>
      <div className="space-x-3">
        <a href="/cart" className="underline">回到购物车</a>
        <a href="/products" className="underline">继续浏览商品</a>
      </div>
    </main>
  );
}
