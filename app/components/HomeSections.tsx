"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIsOwner } from "@/lib/useIsOwner";
import { inStock, type ListingProduct } from "@/lib/productDisplay";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

type DbCategory = {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean | null;
};

// Customer-facing section names and order. Categories not listed here fall
// back to a title-cased version of their name and go to the end.
const SECTION_META: Record<string, { title: string; order: number }> = {
  RINGS: { title: "Rings", order: 1 },
  MOISSANITE: { title: "The Moissanite Edit", order: 2 },
  CHAINS: { title: "Necklaces", order: 3 },
  NECKLACES: { title: "Necklaces", order: 3 },
  BRACELETS: { title: "Bracelets", order: 4 },
  EARRINGS: { title: "Earrings", order: 5 },
};

// Moissanite has its own page and is shown on the homepage even though its
// category is not part of the main navigation.
const ALWAYS_SHOW = ["MOISSANITE"];

const ITEMS_PER_SECTION = 8;

function sectionMeta(name: string) {
  const key = (name || "").trim().toUpperCase();
  return (
    SECTION_META[key] ?? {
      title: key.charAt(0) + key.slice(1).toLowerCase(),
      order: 99,
    }
  );
}

export default function HomeSections() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [products, setProducts] = useState<ListingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOwner } = useIsOwner();

  const sections = useMemo(() => {
    const visible = isOwner ? products : products.filter(inStock);
    const byCat: Record<string, ListingProduct[]> = {};
    for (const p of visible) {
      if (!p.category_id) continue;
      (byCat[p.category_id] ||= []).push(p);
    }

    return categories
      .map((c) => ({
        category: c,
        meta: sectionMeta(c.name),
        items: (byCat[c.id] || [])
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, ITEMS_PER_SECTION),
      }))
      // An empty section only tells customers the shop is out of stock.
      .filter((s) => s.items.length > 0)
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [categories, products, isOwner]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [{ data: cats, error: catsErr }, { data: prods, error: prodErr }] =
        await Promise.all([
          supabase
            .from("categories")
            .select("id,name,slug,is_active")
            .order("created_at", { ascending: true }),
          supabase
            .from("products")
            .select(
              "id,title,price,final_price,has_discount,discount_percentage,image_url,category_id,created_at,is_active,quantity"
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
        ]);

      if (catsErr) console.error("Failed to load categories:", catsErr.message);
      if (prodErr) console.error("Failed to load products:", prodErr.message);
      if (!mounted) return;

      const safeCats = ((cats as DbCategory[]) || []).filter(
        (c) =>
          c.slug &&
          (c.is_active || ALWAYS_SHOW.includes((c.name || "").toUpperCase()))
      );
      setCategories(safeCats);
      setProducts((prods as ListingProduct[]) || []);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-home-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          const evt = payload.eventType;

          if (evt === "INSERT") {
            const row = payload.new as ListingProduct;
            if (row?.is_active === false) return;
            setProducts((prev) =>
              prev.some((x) => x.id === row.id) ? prev : [row, ...prev]
            );
            return;
          }

          if (evt === "UPDATE") {
            const row = payload.new as ListingProduct;
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
            const id = (payload.old as { id?: string })?.id;
            if (!id) return;
            setProducts((prev) => prev.filter((x) => x.id !== id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="bg-white pt-16 pb-8 md:pt-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6">
        {loading
          ? [0, 1].map((i) => (
              <div key={i} className="mb-20">
                <div className="napd-skeleton mb-10 h-8 w-40 rounded-sm" />
                <div className="grid grid-cols-2 gap-x-5 md:grid-cols-4 md:gap-x-8">
                  {[0, 1, 2, 3].map((j) => (
                    <ProductCardSkeleton
                      key={j}
                      className={j > 1 ? "hidden md:block" : ""}
                    />
                  ))}
                </div>
              </div>
            ))
          : sections.map(({ category, meta, items }) => (
              <div key={category.id} className="mb-20 md:mb-24">
                <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#182B2A]/10 pb-4 md:mb-10">
                  <Link
                    href={`/${category.slug}`}
                    className="napd-display napd-heading-link text-3xl md:text-[2.5rem] italic text-[#182B2A]"
                  >
                    {meta.title}
                  </Link>

                  <Link
                    href={`/${category.slug}`}
                    className="napd-link shrink-0 text-[11px] uppercase tracking-[0.2em] text-[#86663A]"
                  >
                    View All
                  </Link>
                </div>

                {/* Phones: swipeable row. Desktop: one row of four. */}
                <div className="napd-row -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-x-8 md:overflow-visible md:px-0">
                  {items.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      sizes="(min-width: 768px) 270px, 42vw"
                      className={`w-[42vw] max-w-[220px] shrink-0 snap-start md:w-auto md:max-w-none ${
                        i >= 4 ? "md:hidden" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
