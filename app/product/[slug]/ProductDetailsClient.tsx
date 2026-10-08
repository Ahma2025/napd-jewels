"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "../../context/CartContext";
import { useIsOwner } from "@/lib/useIsOwner";
import { displayTitle, formatPrice, productName } from "@/lib/productDisplay";
import { useLang } from "../../context/LangContext";
import { onlyLeftLabel, type DictKey } from "@/lib/i18n";
import { MessageCircle, ShieldCheck, Gem, Truck, RefreshCw } from "lucide-react";

type DbProduct = {
  id: string;
  title: string;
  title_ar?: string | null;
  price: number;
  quantity: number;
  has_discount: boolean | null;
  discount_percentage: number | null;
  final_price: number | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
  category_id: string;
  categories?: { name: string } | { name: string }[] | null;
};

type DbProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type DbProductParameter = {
  id: string;
  product_id: string;
  key: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// حط رقم حميد هون بصيغة دولية بدون +
const WHATSAPP_NUMBER = "972593255260";

const RING_SIZES = ["15", "16", "17", "18", "19", "20", "21"];

function formatMoney(n: number) {
  return formatPrice(n);
}

const CATEGORY_LINKS: Record<string, { href: string; label: DictKey }> = {
  RINGS: { href: "/rings", label: "cat.RINGS" },
  CHAINS: { href: "/chains", label: "cat.CHAINS" },
  BRACELETS: { href: "/bracelets", label: "cat.BRACELETS" },
  EARRINGS: { href: "/earrings", label: "cat.EARRINGS" },
  MOISSANITE: { href: "/moissanite", label: "cat.MOISSANITE_EDIT" },
  SETS: { href: "/sets", label: "cat.SETS" },
};

const PARAM_KEYS = new Set([
  "zircon_grade",
  "main_stone_size",
  "main_stone_shape",
  "main_stone_cut",
  "plating_color",
  "main_stone_carat",
]);

export default function ProductDetailsClient({ id }: { id: string }) {
  const safeId = id || "";
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [sizeTouched, setSizeTouched] = useState(false);

  const { addToCart } = useCart();
  const { lang, t } = useLang();
  const paramLabel = (key: string) =>
    PARAM_KEYS.has(key) ? t(`param.${key}` as DictKey) : key;
  const { isOwner, loading: ownerLoading } = useIsOwner();

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [parameters, setParameters] = useState<DbProductParameter[]>([]);

  // IMPORTANT: خلي الرابط ثابت عشان ما يصير Hydration mismatch
  // لازم تضيف في .env.local:
  // NEXT_PUBLIC_SITE_URL=http://localhost:3000
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const productUrl = `${siteUrl}/product/${safeId}`;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!safeId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [
        { data: prod, error: prodErr },
        { data: imgs, error: imgsErr },
        { data: params, error: paramsErr },
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id,title,title_ar,price,quantity,has_discount,discount_percentage,final_price,image_url,is_active,created_at,category_id,categories(name)"
          )
          .eq("id", safeId)
          .single(),
        supabase
          .from("product_images")
          .select("id,product_id,image_url,sort_order,created_at")
          .eq("product_id", safeId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("product_parameters")
          .select("id,product_id,key,value,sort_order,created_at,updated_at")
          .eq("product_id", safeId)
          .order("sort_order", { ascending: true }),
      ]);

      if (!mounted) return;

      if (prodErr) {
        setProduct(null);
        setImages([]);
        setActiveIndex(0);
        setParameters([]);
        setLoading(false);
        return;
      }

      setProduct((prod as DbProduct) || null);
      setSize(null);
      setSizeTouched(false);

      const rows = (imgs as DbProductImage[]) || [];
      const urls = rows
        .map((r) => (r.image_url || "").trim())
        .filter((u) => !!u);

      // fallback للقديم (لو ما في جدول صور لسا)
      const fallback = (prod as DbProduct)?.image_url?.trim();
      const finalImgs = urls.length ? urls : fallback ? [fallback] : ["/hero.jpeg"];

      setImages(finalImgs);
      setActiveIndex(0);

      const pRows = (params as DbProductParameter[]) || [];
      setParameters(pRows);

      // لو في مشكلة بتحميل الصور مش قاتلة، بنضل نعرض fallback
      if (imgsErr && !urls.length) {
        // ignore
      }

      // لو في مشكلة بتحميل المواصفات مش قاتلة برضو
      if (paramsErr) {
        // ignore
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [safeId]);

  const title = useMemo(
    () => (product ? productName(product, lang) : ""),
    [product, lang]
  );

  const categoryName = useMemo(() => {
    const cats = product?.categories;
    const catName = Array.isArray(cats) ? cats[0]?.name : cats?.name;
    return (catName || "").toUpperCase();
  }, [product?.categories]);

  const categoryLink = CATEGORY_LINKS[categoryName] ?? null;

  // Moissanite pieces are rings too and need a size.
  const isRing = categoryName === "RINGS" || categoryName === "MOISSANITE";

  const needsSize = isRing && !size;

  const hasDiscount = useMemo(() => {
    return !!(
      product?.has_discount &&
      product?.discount_percentage &&
      product.discount_percentage > 0
    );
  }, [product?.has_discount, product?.discount_percentage]);

  const basePriceNumber = useMemo(() => Number(product?.price || 0), [product?.price]);

  const finalPriceNumber = useMemo(() => {
    if (!product) return 0;
    if (!hasDiscount) return Number(product.price || 0);
    return Number(product.final_price ?? product.price ?? 0);
  }, [product, hasDiscount]);

  const inStock = useMemo(() => {
    if (!product) return false;
    const active = product.is_active !== false;
    return active && Number(product.quantity || 0) > 0;
  }, [product]);

  // Out-of-stock products stay hidden from regular customers (direct link
  // or otherwise) — only the owner can still open them, to edit later.
  const visibleToViewer = isOwner || inStock;
  const pageLoading = loading || ownerLoading;

  const maxQty = useMemo(() => {
    const q = Number(product?.quantity || 0);
    if (!Number.isFinite(q) || q < 0) return 0;
    return q;
  }, [product?.quantity]);

  useEffect(() => {
    if (!inStock) {
      setQty(1);
      return;
    }
    setQty((prev) => Math.min(Math.max(1, prev), Math.max(1, maxQty)));
  }, [inStock, maxQty]);

  const activeImage = useMemo(() => {
    if (!images.length) return "/hero.jpeg";
    const idx = Math.min(Math.max(0, activeIndex), images.length - 1);
    return images[idx] || "/hero.jpeg";
  }, [images, activeIndex]);

  const waText = useMemo(() => {
    const en = displayTitle(product?.title);
    const shown = product ? productName(product, lang) : en;
    const piece = lang === "ar" && shown !== en ? `${shown} (${en})` : en;
    const priceLine = hasDiscount
      ? `${t("wa.price")}: ${formatMoney(finalPriceNumber)} (${t("wa.before")}: ${formatMoney(
          basePriceNumber
        )}, ${t("wa.discount")}: ${product?.discount_percentage || 0}%)`
      : `${t("wa.price")}: ${formatMoney(basePriceNumber)}`;

    const sizeLine = isRing && size ? `\n${t("wa.size")}: ${size}` : "";

    return `${t("wa.hello")}
${t("wa.piece")}: ${piece}${sizeLine}
${priceLine}
${t("wa.qty")}: ${qty}
${t("wa.link")}: ${productUrl}`;
  }, [
    product,
    lang,
    t,
    product?.title,
    product?.discount_percentage,
    qty,
    productUrl,
    hasDiscount,
    finalPriceNumber,
    basePriceNumber,
    isRing,
    size,
  ]);

  const waLink = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
  }, [waText]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) return;
    if (isRing && !size) {
      setSizeTouched(true);
      return;
    }

    const allowedQty = Math.min(Math.max(1, qty), Math.max(1, maxQty));

    for (let i = 0; i < allowedQty; i++) {
      addToCart({
        id: product.id,
        name: displayTitle(product.title),
        price: finalPriceNumber,
        image: activeImage,
        size: isRing && size ? size : undefined,
      });
    }
  };

  const hasParameters = useMemo(() => {
    return parameters.some((p) => (p.value || "").trim());
  }, [parameters]);

  const pct = Number(product?.discount_percentage || 0);
  const lowStock = inStock && maxQty > 0 && maxQty <= 2;

  return (
    <section className="bg-white pt-8 pb-20 md:pt-10">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-x-2 text-[11px] uppercase tracking-[0.18em] text-[#5E6B69]"
        >
          <Link href="/" className="napd-link">
            {t("pdp.home")}
          </Link>
          {categoryLink && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={categoryLink.href} className="napd-link">
                {t(categoryLink.label)}
              </Link>
            </>
          )}
          {product && visibleToViewer && (
            <>
              <span aria-hidden="true">/</span>
              <span className="text-[#182B2A] normal-case tracking-normal text-[13px]">
                {title}
              </span>
            </>
          )}
        </nav>

        {pageLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16" aria-hidden="true">
            <div className="napd-skeleton aspect-square w-full rounded-md" />
            <div className="space-y-4 lg:pt-4">
              <div className="napd-skeleton h-10 w-3/4 rounded-sm" />
              <div className="napd-skeleton h-6 w-1/3 rounded-sm" />
              <div className="napd-skeleton mt-10 h-14 w-full rounded-full" />
            </div>
          </div>
        ) : !product || !visibleToViewer ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="napd-display text-3xl text-[#182B2A]">
              {t("pdp.goneTitle")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#5E6B69]">
              {t("pdp.goneBody")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="napd-btn inline-flex h-12 items-center rounded-full bg-[#182B2A] px-6 text-[12px] uppercase tracking-[0.18em] text-[#FAF7F1]"
              >
                {t("pdp.browse")}
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center rounded-full border border-[#182B2A]/20 px-6 text-[12px] uppercase tracking-[0.18em] text-[#182B2A]"
              >
                {t("pdp.ask")}
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Images */}
            <div>
              <div className="relative w-full aspect-square overflow-hidden rounded-md border border-[#182B2A]/[0.08] bg-white">
                <div className="absolute inset-4 md:inset-8">
                  <Image
                    src={activeImage}
                    alt={title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-contain"
                  />
                </div>
                {hasDiscount && (
                  <span className="absolute start-4 top-4 rounded-sm bg-[#182B2A] px-2 py-1 text-[11px] font-medium tracking-[0.08em] text-[#FAF7F1] tabular-nums">
                    <bdi dir="ltr">−{pct}%</bdi>
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, i) => {
                    const active = i === activeIndex;
                    return (
                      <button
                        key={`${img}-${i}`}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={`${t("pdp.showImage")} ${i + 1}`}
                        aria-pressed={active}
                        className={[
                          "relative h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-md border bg-white transition-colors duration-200",
                          active
                            ? "border-[#B08D57]"
                            : "border-[#182B2A]/10 hover:border-[#182B2A]/30",
                        ].join(" ")}
                      >
                        <span className="absolute inset-1.5">
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="76px"
                            className="object-contain"
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="lg:pt-4">
              <h1 className="napd-display text-[clamp(2.4rem,4.2vw,3.6rem)] leading-[1] text-[#182B2A]">
                {title}
              </h1>
              <div aria-hidden="true" className="napd-divider mt-5">
                <i />
              </div>

              <div className="mt-5 flex items-baseline gap-3 tabular-nums">
                <p className="text-2xl font-semibold text-[#182B2A]">
                  {formatMoney(finalPriceNumber)}
                </p>
                {hasDiscount && (
                  <p className="text-base text-[#5E6B69] line-through">
                    {formatMoney(basePriceNumber)}
                  </p>
                )}
              </div>

              <p className="mt-3 flex items-center gap-2 text-[13px] text-[#5E6B69]">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-[#2F7A5B]" : "bg-[#B4483C]"}`}
                />
                {!inStock
                  ? t("pdp.outOfStock")
                  : lowStock
                  ? onlyLeftLabel(lang, maxQty)
                  : t("pdp.inStock")}
              </p>

              {/* Ring Size */}
              {isRing && (
                <div className="mt-9">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#5E6B69]">
                    {t("pdp.ringSize")}
                    {needsSize && sizeTouched ? (
                      <span className="ms-2 normal-case tracking-normal text-[13px] text-[#B4483C]">
                        {t("pdp.chooseSize")}
                      </span>
                    ) : null}
                  </p>

                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("pdp.ringSize")}>
                    {RING_SIZES.map((s) => {
                      const active = size === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            setSize(s);
                            setSizeTouched(false);
                          }}
                          disabled={!inStock}
                          className={[
                            "napd-btn h-11 w-11 rounded-full border text-sm tabular-nums transition-colors duration-200 disabled:opacity-50",
                            active
                              ? "border-[#182B2A] bg-[#182B2A] text-[#FAF7F1]"
                              : "border-[#182B2A]/15 text-[#182B2A] hover:border-[#182B2A]/40",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-8">
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#5E6B69]">
                  {t("pdp.quantity")}
                </p>

                <div className="inline-flex items-center overflow-hidden rounded-full border border-[#182B2A]/15 text-[#182B2A]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center hover:bg-[#FAF7F1] disabled:opacity-40"
                    aria-label={t("pdp.decrease")}
                    disabled={!inStock || qty <= 1}
                  >
                    −
                  </button>
                  <div className="flex h-11 w-10 items-center justify-center tabular-nums" aria-live="polite">
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) => Math.min(Math.max(1, q + 1), Math.max(1, maxQty)))
                    }
                    className="flex h-11 w-11 items-center justify-center hover:bg-[#FAF7F1] disabled:opacity-40"
                    aria-label={t("pdp.increase")}
                    disabled={!inStock || qty >= maxQty}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions: WhatsApp is where orders actually close */}
              <div className="mt-9 space-y-3">
                <a
                  href={isRing && !size ? undefined : waLink}
                  onClick={(e) => {
                    if (isRing && !size) {
                      e.preventDefault();
                      setSizeTouched(true);
                    }
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!inStock}
                  className={[
                    "napd-btn flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-[12px] uppercase tracking-[0.2em]",
                    inStock
                      ? "cursor-pointer bg-[#182B2A] text-[#FAF7F1]"
                      : "pointer-events-none bg-[#182B2A]/30 text-[#FAF7F1]",
                  ].join(" ")}
                >
                  <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px]" />
                  {t("pdp.order")}
                </a>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="napd-btn h-12 w-full rounded-full border border-[#182B2A]/20 text-[12px] uppercase tracking-[0.2em] text-[#182B2A] transition-colors duration-200 hover:border-[#182B2A]/50 disabled:opacity-40"
                >
                  {t("pdp.addToCart")}
                </button>

                <p className="pt-1 text-center text-[12px] text-[#5E6B69]">
                  {t("pdp.note")}
                </p>
              </div>

              {/* Promises */}
              <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#182B2A]/10 pt-7 text-[13px] text-[#182B2A]/80">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0 text-[#86663A]" />
                  {t("pdp.p.warranty")}
                </li>
                <li className="flex items-center gap-2.5">
                  <Gem aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0 text-[#86663A]" />
                  {t("pdp.p.silver")}
                </li>
                <li className="flex items-center gap-2.5">
                  <Truck aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0 text-[#86663A]" />
                  {t("pdp.p.delivery")}
                </li>
                <li className="flex items-center gap-2.5">
                  <RefreshCw aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0 text-[#86663A]" />
                  {t("pdp.p.exchange")}
                </li>
              </ul>

              {/* Product details */}
              {hasParameters && (
                <div className="mt-9 border-t border-[#182B2A]/10 pt-7">
                  <h2 className="napd-display text-2xl text-[#182B2A]">{t("pdp.details")}</h2>
                  <dl className="mt-4 divide-y divide-[#182B2A]/[0.07]">
                    {parameters
                      .filter((p) => (p.value || "").trim())
                      .map((p) => (
                        <div key={p.id} className="grid grid-cols-2 gap-4 py-3 text-[13px]">
                          <dt className="text-[#5E6B69]">{paramLabel(p.key)}</dt>
                          <dd className="text-[#182B2A]">{p.value}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
