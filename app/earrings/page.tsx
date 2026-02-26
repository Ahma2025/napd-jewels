"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
  price: number;
  final_price: number | null;
  has_discount: boolean | null;
  discount_percentage: number | null;
  image_url: string | null;
  created_at: string;
};

function formatMoney(n: number) {
  return Number(n || 0).toFixed(2);
}

export default function EarringsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("name", "EARRINGS")
        .single();

      if (!category?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,title,price,final_price,has_discount,discount_percentage,image_url,created_at"
        )
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && mounted) {
        setProducts(data || []);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex items-end justify-between border-b pb-4 mb-10">
        <h1 className="text-2xl tracking-widest font-medium uppercase">
          EARRINGS
        </h1>

        <Link href="/" className="text-sm tracking-widest hover:underline">
          Back Home
        </Link>
      </div>

      {loading ? (
        <div className="text-black/50">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-black/50">
          No products available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const hasDiscount =
              product.has_discount &&
              product.discount_percentage &&
              product.discount_percentage > 0;

            const finalPrice = hasDiscount
              ? product.final_price ?? product.price
              : product.price;

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                <div className="relative w-full aspect-[3/4] bg-[#f6f6f6] rounded-lg overflow-hidden">
                  <Image
                    src={product.image_url || "/hero.jpeg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-sm font-medium truncate">
                    {product.title}
                  </div>

                  {hasDiscount ? (
                    <>
                      <div className="text-xs text-black/40 line-through">
                        {formatMoney(product.price)}
                      </div>
                      <div className="text-base font-medium text-[#123E38]">
                        {formatMoney(finalPrice)}
                      </div>
                    </>
                  ) : (
                    <div className="text-base font-medium">
                      {formatMoney(product.price)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}