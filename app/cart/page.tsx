"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useOccasion } from "../context/OccasionContext";
import OccasionMotif from "../components/OccasionMotif";
import { THEMES, occasionText } from "@/lib/occasion";

export default function CartPage() {
  const { cart, removeFromCart, increase, decrease, subtotal } = useCart();
  const { lang, t } = useLang();
  const occasion = useOccasion();

  const heading = (
    <div className="mb-12 text-center md:mb-16">
      <h1 className="napd-caps-wide text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-napd-ink">{t("cart.title")}</h1>
      <div aria-hidden="true" className="mx-auto mt-6 h-px w-14 bg-napd-ink/30" />
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 text-center md:pt-20">
        {heading}
        <p className="text-napd-muted">{t("cart.empty")}</p>
        <Link href="/" className="napd-pill mt-10">
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 md:pt-20">
      {heading}

      {occasion && (
        <p className="mb-8 flex items-center justify-center gap-3 bg-napd-paper/70 px-5 py-4 text-center text-[13px] text-napd-ink/80">
          <OccasionMotif motif={THEMES[occasion.theme]?.motif ?? "star"} strokeWidth={1.4} className="h-4 w-4 shrink-0 text-napd-bronze" />
          <span>
            <span className="napd-caps me-2 text-[11px] text-napd-bronze">{occasionText(occasion, lang).name}</span>
            {t("occasion.cartNote")}
          </span>
        </p>
      )}

      <div className="border-y border-napd-ink/10">
        {cart.map((item) => (
          <div
            key={`${item.id}-${item.size ?? ""}`}
            className="grid grid-cols-[80px_1fr] items-center gap-x-5 gap-y-3 border-b border-napd-ink/10 py-6 last:border-b-0 md:grid-cols-[96px_1fr_auto_7rem_auto] md:gap-x-8"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#F7F6F3] md:h-24 md:w-24">
              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2 mix-blend-multiply" />
            </div>

            <div>
              <div className="napd-card-name text-[12.5px] text-napd-ink">{item.name}</div>
              {item.size ? (
                <div className="mt-1 text-[12px] text-napd-muted">
                  {t("pdp.ringSize")}: {item.size}
                </div>
              ) : null}
              <div className="mt-1.5 text-[13px] tracking-[0.12em] text-napd-ink/60 tabular-nums">₪ {item.price}</div>
            </div>

            {/* Qty */}
            <div className="col-start-2 flex items-center gap-2 md:col-start-auto">
              <button
                onClick={() => decrease(item.id, item.size)}
                aria-label={t("pdp.decrease")}
                className="h-9 w-9 rounded-full border border-napd-ink/15 transition hover:border-napd-ink/40"
              >
                −
              </button>
              <div className="w-8 text-center tabular-nums">{item.quantity}</div>
              <button
                onClick={() => increase(item.id, item.size)}
                aria-label={t("pdp.increase")}
                className="h-9 w-9 rounded-full border border-napd-ink/15 transition hover:border-napd-ink/40"
              >
                +
              </button>
            </div>

            <div className="col-start-2 text-[14px] tracking-[0.1em] text-napd-ink tabular-nums md:col-start-auto md:text-end">
              ₪ {item.price * item.quantity}
            </div>

            <button
              onClick={() => removeFromCart(item.id, item.size)}
              className="napd-caps col-start-2 justify-self-start text-[10.5px] text-napd-muted underline-offset-4 hover:text-napd-ink hover:underline md:col-start-auto"
            >
              {t("cart.remove")}
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex items-baseline gap-4">
          <span className="napd-caps text-[11px] text-napd-muted">{t("cart.subtotal")}</span>
          <span className="text-[1.35rem] tracking-[0.1em] text-napd-ink tabular-nums">₪ {subtotal}</span>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/" className="napd-caps text-[11px] text-napd-muted hover:text-napd-ink">
            {t("cart.continue")}
          </Link>
          <Link href="/checkout" className="napd-pill">
            {t("cart.checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
