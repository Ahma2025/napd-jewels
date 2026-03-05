"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "../../context/CartContext";

type DbProduct = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  has_discount: boolean | null;
  discount_percentage: number | null;
  final_price: number | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
  category_id: string;
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

function formatMoney(n: number) {
  return Number(n || 0).toFixed(2);
}

function paramLabel(key: string) {
  if (key === "zircon_grade") return "Zircon Grade";
  if (key === "main_stone_size") return "Main stone size";
  if (key === "main_stone_shape") return "Main stone shape";
  if (key === "main_stone_cut") return "Main stone cut";
  if (key === "plating_color") return "Plating color";
  if (key === "main_stone_carat") return "Main stone carat";
  return key;
}

export default function ProductDetailsClient({ id }: { id: string }) {
  const safeId = id || "";
  const [qty, setQty] = useState(1);

  const { addToCart } = useCart();

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
            "id,title,price,quantity,has_discount,discount_percentage,final_price,image_url,is_active,created_at,category_id"
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

  const title = useMemo(() => {
    return (product?.title || "Product").toUpperCase();
  }, [product?.title]);

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
    const t = product?.title || "Product";
    const priceLine = hasDiscount
      ? `السعر: ${formatMoney(finalPriceNumber)} (قبل الخصم: ${formatMoney(
          basePriceNumber
        )}, خصم: ${product?.discount_percentage || 0}%)`
      : `السعر: ${formatMoney(basePriceNumber)}`;

    return `مرحبا ، بدي أطلب:
المنتج: ${t}
${priceLine}
الكمية: ${qty}
رابط المنتج: ${productUrl}`;
  }, [
    product?.title,
    product?.discount_percentage,
    qty,
    productUrl,
    hasDiscount,
    finalPriceNumber,
    basePriceNumber,
  ]);

  const waLink = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
  }, [waText]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) return;

    const allowedQty = Math.min(Math.max(1, qty), Math.max(1, maxQty));

    for (let i = 0; i < allowedQty; i++) {
      addToCart({
        id: product.id,
        name: product.title,
        price: finalPriceNumber,
        image: activeImage,
      });
    }
  };

  const hasParameters = useMemo(() => {
    return parameters.some((p) => (p.value || "").trim());
  }, [parameters]);

  return (
    <section className="bg-white py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="text-sm tracking-widest text-gray-500 mb-8">
          <Link href="/" className="hover:underline">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/" className="hover:underline">
            SHOP
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </div>

        {loading ? (
          <div className="text-black/50">Loading...</div>
        ) : !product ? (
          <div className="text-black/60">Product not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Images */}
            <div>
              <div className="relative w-full h-[420px] md:h-[520px] bg-[#f6f6f6] rounded-xl overflow-hidden">
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={[
                        "relative w-[86px] h-[86px] bg-[#f6f6f6] rounded-lg overflow-hidden flex-shrink-0 border transition",
                        active ? "border-gray-400" : "border-transparent hover:border-gray-300",
                      ].join(" ")}
                      aria-label={`Thumbnail ${i + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:pt-2">
              <h1 className="text-2xl md:text-3xl tracking-widest font-medium">
                {title}
              </h1>

              <div className="mt-4 flex items-center gap-4 flex-wrap">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <p className="text-base md:text-lg text-black/40 line-through tracking-wide">
                      {formatMoney(basePriceNumber)}
                    </p>
                    <p className="text-xl md:text-2xl font-medium tracking-wide text-[#123E38]">
                      {formatMoney(finalPriceNumber)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl md:text-2xl font-medium tracking-wide">
                    {formatMoney(basePriceNumber)}
                  </p>
                )}

                <span
                  className={[
                    "text-sm px-3 py-1 rounded-full border",
                    inStock
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200",
                  ].join(" ")}
                >
                  {inStock ? "IN STOCK" : "OUT OF STOCK"}
                </span>

                {inStock && (
                  <span className="text-xs text-black/45 tracking-widest">
                    AVAILABLE: {maxQty}
                  </span>
                )}
              </div>

              {/* ✅ NEW: Product Parameters */}
              {hasParameters && (
                <div className="mt-8 max-w-[420px] border rounded-xl overflow-hidden">
                  <div className="px-4 py-4 bg-[#f6f6f6] border-b">
                    <div className="text-sm tracking-widest text-gray-700">
                      Product Parameters
                    </div>
                  </div>

                  <div className="divide-y">
                    {parameters
                      .filter((p) => (p.value || "").trim())
                      .map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 py-4"
                        >
                          <div className="text-sm text-gray-600">
                            {paramLabel(p.key)}
                          </div>
                          <div className="text-sm text-gray-900">{p.value}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div className="mt-6 border-t pt-6">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-gray-900">•</span>
                    <span>Silver jewelry — premium finish</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-900">•</span>
                    <span>Delivery available</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-900">•</span>
                    <span>Easy exchange policy</span>
                  </li>
                </ul>
              </div>

              {/* Quantity */}
              <div className="mt-8">
                <p className="text-sm tracking-widest text-gray-500 mb-3">QUANTITY</p>

                <div className="inline-flex items-center border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Decrease quantity"
                    disabled={!inStock}
                  >
                    -
                  </button>

                  <div className="w-14 h-12 flex items-center justify-center text-base">
                    {qty}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) => Math.min(Math.max(1, q + 1), Math.max(1, maxQty)))
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Increase quantity"
                    disabled={!inStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-12 rounded-lg bg-black text-white tracking-widest text-sm hover:bg-black/90 transition disabled:opacity-50 disabled:hover:bg-black"
                >
                  ADD TO CART
                </button>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "h-12 rounded-lg tracking-widest text-sm flex items-center justify-center transition",
                    inStock
                      ? "bg-[#25D366] text-white hover:opacity-90"
                      : "bg-gray-200 text-gray-500 pointer-events-none",
                  ].join(" ")}
                >
                  BUY VIA WHATSAPP
                </a>
              </div>

              <p className="mt-6 text-xs text-gray-500 tracking-wide">
                WhatsApp message will include product link and quantity.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}