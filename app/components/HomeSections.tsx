"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type DbCategory = {
  id: string;
  name: string;
  slug: string | null;
};

type DbProduct = {
  id: string;
  title: string;
  price: number;
  final_price: number | null;
  has_discount: boolean | null;
  discount_percentage: number | null;
  image_url: string | null;
  category_id: string;
  created_at: string;
  is_active: boolean | null;
};

function formatMoney(n: number) {
  return Number(n || 0).toFixed(2);
}

function displayCategoryName(name: string) {
  const n = (name || "").trim().toUpperCase();
  if (n === "CHAINS") return "NECKLACES";
  return n; // باقي الأقسام نخليها زي ما هي (Uppercase)
}

export default function HomeSections() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);

  const productsByCategory = useMemo(() => {
    const map: Record<string, DbProduct[]> = {};

    for (const p of products) {
      if (!map[p.category_id]) {
        map[p.category_id] = [];
      }
      map[p.category_id].push(p);
    }

    // تأكيد ترتيب أحدث أولاً داخل كل قسم
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return map;
  }, [products]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: cats, error: catsErr } = await supabase
        .from("categories")
        .select("id,name,slug")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (catsErr) {
        alert(catsErr.message || "Failed to load categories");
        return;
      }

      if (!mounted) return;
      const safeCats = ((cats as DbCategory[]) || []).filter((c) => c.slug);
      setCategories(safeCats);

      const { data: prods, error: prodErr } = await supabase
        .from("products")
        .select(
          "id,title,price,final_price,has_discount,discount_percentage,image_url,category_id,created_at,is_active"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (prodErr) {
        alert(prodErr.message || "Failed to load products");
        return;
      }

      if (!mounted) return;
      setProducts((prods as DbProduct[]) || []);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Realtime: أي إضافة/تعديل/حذف على المنتجات ينعكس مباشرة على الهوم
  useEffect(() => {
    const channel = supabase
      .channel("realtime-home-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          const evt = payload.eventType;

          if (evt === "INSERT") {
            const row = payload.new as DbProduct;
            if (row?.is_active === false) return;

            setProducts((prev) => {
              if (prev.some((x) => x.id === row.id)) return prev;
              return [row, ...prev];
            });
            return;
          }

          if (evt === "UPDATE") {
            const row = payload.new as DbProduct;

            setProducts((prev) => {
              if (row?.is_active === false) {
                return prev.filter((x) => x.id !== row.id);
              }

              const idx = prev.findIndex((x) => x.id === row.id);
              if (idx === -1) return [row, ...prev];

              const next = prev.slice();
              next[idx] = row;
              return next;
            });
            return;
          }

          if (evt === "DELETE") {
            const oldRow = payload.old as { id?: string };
            const id = oldRow?.id;
            if (!id) return;

            setProducts((prev) => prev.filter((x) => x.id !== id));
            return;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        {categories.map((category) => {
          const items = (productsByCategory[category.id] || []).slice(0, 6);

          return (
            <div key={category.id} className="mb-20">
              {/* Title Row */}
              <div className="flex justify-between items-center border-b pb-4 mb-10">
                <Link
                  href={`/${category.slug}`}
                  className="text-xl tracking-widest font-medium hover:underline"
                >
                  {displayCategoryName(category.name)}
                </Link>

                <Link
                  href={`/${category.slug}`}
                  className="text-sm tracking-widest hover:underline"
                >
                  VIEW ALL
                </Link>
              </div>

              {/* Products */}
              {items.length === 0 ? (
                <div className="text-sm text-black/50">No products available</div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {items.map((product) => {
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
                        className="min-w-[160px] md:min-w-[200px] lg:min-w-0 lg:flex-1 flex-shrink-0 text-center group cursor-pointer block"
                      >
                        <div className="relative w-full h-[200px] md:h-[260px] bg-[#f6f6f6] rounded-lg overflow-hidden">
                          <Image
                            src={product.image_url || "/hero.jpeg"}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="mt-4 space-y-1">
                          <p className="text-sm font-medium truncate">
                            {product.title}
                          </p>

                          {hasDiscount ? (
                            <>
                              <p className="text-sm text-black/40 line-through">
                                {formatMoney(product.price)}
                              </p>
                              <p className="text-base md:text-lg font-medium text-[#123E38]">
                                {formatMoney(finalPrice)}
                              </p>
                            </>
                          ) : (
                            <p className="text-base md:text-lg font-medium">
                              {formatMoney(product.price)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}