"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Tilt from "./Tilt";
import {
  displayTitle,
  formatPrice,
  priceInfo,
  type ListingProduct,
} from "@/lib/productDisplay";

type Props = {
  product: ListingProduct;
  sizes?: string;
  className?: string;
};

export default function ProductCard({
  product,
  sizes = "(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw",
  className = "",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const name = displayTitle(product.title);
  const { hasDiscount, pct, original, final } = priceInfo(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`napd-card group block rounded-md focus-visible:outline-none ${className}`}
    >
      <Tilt max={6} lift={6}>
      <div
        className={`napd-card-media relative w-full aspect-square overflow-hidden rounded-md border border-[#182B2A]/[0.08] ${
          loaded ? "bg-white" : "napd-skeleton"
        }`}
      >
        <div className="absolute inset-3 md:inset-4">
          <Image
            src={product.image_url || "/hero.jpeg"}
            alt={name}
            fill
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            className="napd-card-img object-contain object-center"
          />
        </div>

        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 rounded-sm bg-[#182B2A] px-1.5 py-0.5 text-[10px] font-medium tracking-[0.08em] text-[#FAF7F1] tabular-nums">
            −{pct}%
          </span>
        )}
        <span aria-hidden="true" className="napd-shine pointer-events-none absolute inset-0" />
      </div>
      </Tilt>

      <div className="mt-3.5 space-y-1 text-left">
        <p className="truncate text-[13px] leading-snug text-[#182B2A]/80">
          {name}
        </p>

        <p className="flex items-baseline gap-2 tabular-nums">
          <span className="text-[15px] font-semibold text-[#182B2A]">
            {formatPrice(final)}
          </span>
          {hasDiscount && (
            <span className="text-[12px] text-[#5E6B69] line-through">
              {formatPrice(original)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="napd-skeleton w-full aspect-square rounded-md" />
      <div className="mt-3.5 space-y-2">
        <div className="napd-skeleton h-3 w-3/4 rounded-sm" />
        <div className="napd-skeleton h-3.5 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}
