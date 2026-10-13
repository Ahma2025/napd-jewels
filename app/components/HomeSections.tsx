"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIsOwner } from "@/lib/useIsOwner";
import { homepageOrder, inStock, type ListingProduct } from "@/lib/productDisplay";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { useLang } from "../context/LangContext";
import type { DictKey } from "@/lib/i18n";

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

// Moissanite has its own showcase right under the hero, so it is not
// repeated here.
const ALWAYS_SHOW: string[] = [];

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
  const { t } = useLang();
  const sectionTitle = (name: string, fallback: string) => {
    const key = `cat.${(name || "").trim().toUpperCase()}` as DictKey;
    const v = t(key);
    return v && v !== key ? v : fallback;
  };

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
          .sort(homepageOrder)
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
              "id,title,title_ar,price,final_price,has_discount,discount_percentage,image_url,category_id,created_at,is_active,quantity,is_featured,featured_at"
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sections.find((s) => s.category.id === activeId) ?? sections[0];

  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby="napd-collections">
      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        <p id="napd-collections" className="napd-caps-wide text-center text-[11px] text-napd-muted">
          {t("sections.eyebrow")}
        </p>

        {loading ? (
          <>
            <div className="mx-auto mt-8 flex justify-center gap-10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="napd-skeleton h-4 w-28" />
              ))}
            </div>
            <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-5 md:gap-x-8">
              {[0, 1, 2, 3, 4].map((j) => (
                <ProductCardSkeleton key={j} className={j > 1 ? "hidden md:block" : ""} />
              ))}
            </div>
          </>
        ) : (
          active && (
            <>
              {/* the collections as tabs, a rule under the chosen one */}
              <div
                role="tablist"
                aria-label={t("sections.eyebrow")}
                className="scrollbar-hide -mx-5 mt-8 flex gap-8 overflow-x-auto px-5 md:mx-0 md:justify-center md:gap-14 md:px-0"
              >
                {sections.map(({ category, meta }) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={category.id === active.category.id}
                    onClick={() => setActiveId(category.id)}
                    className="napd-tab napd-caps-wide shrink-0 whitespace-nowrap text-[13px] md:text-[15px]"
                  >
                    {sectionTitle(category.name, meta.title)}
                  </button>
                ))}
              </div>

              {/* Phones: swipeable row. Desktop: one row of five. */}
              <div
                key={active.category.id}
                role="tabpanel"
                className="napd-tab-panel napd-row -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 scrollbar-hide md:mx-0 md:mt-16 md:grid md:grid-cols-5 md:gap-x-8 md:overflow-visible md:px-0"
              >
                {active.items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sizes="(min-width: 768px) 240px, 46vw"
                    className={`w-[46vw] max-w-[230px] shrink-0 snap-start md:w-auto md:max-w-none ${
                      i >= 5 ? "md:hidden" : ""
                    }`}
                  />
                ))}
              </div>

              <div className="mt-14 flex justify-center md:mt-16">
                <Link href={`/${active.category.slug}`} className="napd-pill">
                  {t("sections.viewAll")}
                </Link>
              </div>
            </>
          )
        )}
      </div>
    </section>
  );
}
