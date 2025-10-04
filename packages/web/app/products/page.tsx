import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  stock: number;
};

export default async function ProductsPage() {
  const products = await api<Product[]>("/products");
  return (
    <main className="py-6 space-y-6">
      <h1 className="text-2xl font-bold">商品列表</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => <ProductCard key={p.id} {...p} />)}
      </section>



    </main>

    
  );
}
