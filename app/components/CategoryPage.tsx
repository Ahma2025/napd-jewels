"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIsOwner } from "@/lib/useIsOwner";
import { inStock, type ListingProduct } from "@/lib/productDisplay";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { useLang } from "../context/LangContext";
import { piecesLabel, type DictKey } from "@/lib/i18n";

const WHATSAPP_URL = "https://wa.me/972593255260";

type Props = {
  /** Category name as stored in Supabase (e.g. "RINGS", "CHAINS"). */
  dbName: string;
  /** Heading shown to customers. */
  title: string;
};

export default function CategoryPage({ dbName, title }: Props) {
  const { lang, t } = useLang();
  const key = (dbName === "MOISSANITE" ? "cat.MOISSANITE_EDIT" : `cat.${dbName}`) as DictKey;
  const heading = t(key) || title;
  const [products, setProducts] = useState<ListingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOwner } = useIsOwner();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("name", dbName)
        .single();

      if (!category?.id) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,title,title_ar,price,final_price,has_discount,discount_percentage,image_url,created_at,quantity"
        )
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) console.error(`Failed to load ${dbName}:`, error.message);

      if (mounted) {
        const rows = (data as ListingProduct[]) || [];
        setProducts(isOwner ? rows : rows.filter(inStock));
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [dbName, isOwner]);

  return (
    <section className="max-w-[1200px] mx-auto px-5 md:px-6 pt-12 pb-20">
      <div className="flex items-end justify-between gap-4 border-b border-[#182B2A]/10 pb-5 mb-10">
        <div>
          <h1 className="napd-display text-[clamp(2.8rem,6vw,4.75rem)] leading-[0.95] text-[#182B2A]">
            {heading}
          </h1>
          <div aria-hidden="true" className="napd-divider mt-4">
            <i />
          </div>
          {!loading && products.length > 0 && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[#5E6B69] tabular-nums">
              {piecesLabel(lang, products.length)}
            </p>
          )}
        </div>

        <Link
          href="/"
          className="napd-link text-[11px] uppercase tracking-[0.2em] text-[#86663A]"
        >
          {t("catpage.back")}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="napd-display text-2xl text-[#182B2A]">
            {t("catpage.emptyTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#5E6B69]">
            {t("catpage.emptyBody")}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="napd-btn mt-7 inline-flex items-center justify-center rounded-full bg-[#182B2A] px-6 py-3 text-[12px] uppercase tracking-[0.18em] text-[#FAF7F1]"
          >
            {t("catpage.ask")}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizes="(min-width: 1024px) 270px, (min-width: 768px) 30vw, 45vw"
            />
          ))}
        </div>
      )}
    </section>
  );
}
