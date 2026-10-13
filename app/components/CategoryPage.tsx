"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIsOwner } from "@/lib/useIsOwner";
import { inStock, type ListingProduct } from "@/lib/productDisplay";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { useLang } from "../context/LangContext";
import { piecesLabel, type DictKey } from "@/lib/i18n";
import { OccasionDivider } from "./OccasionOrnament";
import { useOccasion } from "../context/OccasionContext";
import { THEMES, occasionCategory, occasionText } from "@/lib/occasion";

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
  const occasion = useOccasion();
  const occText = occasion ? occasionText(occasion, lang) : null;
  const featured = occasion ? occasionCategory(occasion) === dbName : false;

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
    <section className="mx-auto max-w-[1360px] px-5 pb-24 pt-14 md:px-10 md:pt-20">
      <div className="mb-14 text-center md:mb-20">
        <Link href="/" className="napd-caps text-[10.5px] text-napd-muted transition-colors hover:text-napd-ink">
          {t("catpage.back")}
        </Link>
        {occasion && featured ? (
          <p className="napd-caps mt-8 text-[11px] text-napd-bronze">
            {t("occasion.editTitle")} {occText!.name}
          </p>
        ) : null}
        <h1 className="napd-caps-wide mt-5 text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-napd-ink">
          {heading}
        </h1>
        {occasion ? (
          <OccasionDivider motif={THEMES[occasion.theme]?.motif ?? "star"} className="mt-6 text-napd-gold" />
        ) : (
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-14 bg-napd-ink/30" />
        )}
        {!loading && products.length > 0 && (
          <p className="napd-caps mt-5 text-[10.5px] text-napd-muted tabular-nums">
            {piecesLabel(lang, products.length)}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="napd-display text-2xl text-napd-ink">
            {t("catpage.emptyTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-napd-muted">
            {t("catpage.emptyBody")}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="napd-pill mt-8"
          >
            {t("catpage.ask")}
          </a>
        </div>
      ) : (
        <div className="napd-tab-panel grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 xl:grid-cols-5">
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
