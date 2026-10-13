"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabase";
import { useLang } from "../context/LangContext";
import OccasionRibbon from "./OccasionRibbon";
import { useOccasion } from "../context/OccasionContext";

const PRIMARY = "rgb(var(--c-ink))";
const GOLD = "rgb(var(--c-gold))";

const navLinkClass =
  "napd-caps relative text-[13px] text-napd-ink/75 transition-colors duration-300 hover:text-napd-ink " +
  "after:content-[''] after:absolute after:start-0 after:-bottom-2 after:h-[1px] after:w-0 after:bg-napd-ink " +
  "after:transition-all after:duration-300 hover:after:w-full";

type Profile = {
  full_name: string | null;
  role: "owner" | "customer" | null;
  orders_last_seen_at: string | null;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { cart } = useCart();
  const { lang, setLang, t } = useLang();
  const occasion = useOccasion();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const displayName = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (name) return name;
    return userId ? t("nav.account") : t("nav.login");
  }, [profile?.full_name, userId, t]);

  const isOwner = profile?.role === "owner";

  // Desktop account dropdown
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!isAccountOpen) return;
      const el = accountWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isAccountOpen]);

  // Close dropdowns on route change
  useEffect(() => {
    setIsAccountOpen(false);
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setAuthLoading(true);

      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;

      if (!mounted) return;

      setUserId(uid);

      if (!uid) {
        setProfile(null);
        setNewOrdersCount(0);
        setAuthLoading(false);
        return;
      }

      const { data: p, error } = await supabase
        .from("profiles")
        .select("full_name, role, orders_last_seen_at")
        .eq("id", uid)
        .single();

      if (!mounted) return;

      if (error) {
        setProfile(null);
      } else {
        setProfile(p as Profile);
      }

      setAuthLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // New Orders Badge (Owner only) - real "notifications" style based on orders_last_seen_at
  useEffect(() => {
    if (!userId || !isOwner) {
      setNewOrdersCount(0);
      return;
    }

    let cancelled = false;

    async function refreshCount() {
      const lastSeen = profile?.orders_last_seen_at ?? null;

      // count orders created after lastSeen (or all if lastSeen null)
      let q = supabase.from("orders").select("id", { count: "exact", head: true });

      if (lastSeen) q = q.gt("created_at", lastSeen);

      const { count, error } = await q;

      if (cancelled) return;

      if (error) {
        setNewOrdersCount(0);
        return;
      }

      setNewOrdersCount(count ?? 0);
    }

    refreshCount();

    // Realtime: increment badge on each new order if it's "new" relative to lastSeen
    const lastSeen = profile?.orders_last_seen_at ?? null;

    const channel = supabase
      .channel("owner-orders-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (cancelled) return;

          // If owner is currently on orders page, do not increment here.
          // The orders page itself will set last_seen and re-render badge to 0.
          if (pathname?.startsWith("/owner/orders")) return;

          const createdAt = (payload.new as any)?.created_at as string | undefined;

          if (!lastSeen) {
            setNewOrdersCount((c) => c + 1);
            return;
          }

          if (
            createdAt &&
            new Date(createdAt).getTime() > new Date(lastSeen).getTime()
          ) {
            setNewOrdersCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId, isOwner, profile?.orders_last_seen_at, pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
    setIsOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md">
      <OccasionRibbon />
      {/* ANNOUNCEMENT MARQUEE (an occasion's ribbon takes its place) */}
      <div className={`${occasion ? "hidden" : "hidden md:flex"} h-9 items-center overflow-hidden bg-napd-ink`}>
        <div className="napd-marquee-track">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center">
              {[
                t("announce.warranty"),
                t("announce.silver"),
                t("announce.whatsapp"),
              ].map((label) => (
                <div key={label} className="flex items-center gap-3 px-7 whitespace-nowrap">
                  <span
                    dir="auto"
                    className="text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "rgb(var(--c-goldsoft))" }}
                  >
                    {label}
                  </span>
                  <span style={{ color: GOLD }}>✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full border-b border-napd-ink/[0.08] px-5 md:px-10">
        <div className="relative flex h-[72px] items-center justify-between md:h-[88px]">
          {/* LOGO: centred on phones, at the start on desktop */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 shrink-0">
            <span role="img" aria-label="NAPD Jewels" className="napd-logo-mask h-11 w-[50px] text-napd-bronze lg:h-[52px] lg:w-[60px]" />
          </Link>

          {/* DESKTOP NAV, centred like a maison's */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex xl:gap-12">
            <Link href="/chains" className={navLinkClass}>
              {t("nav.necklaces")}
            </Link>
            <Link href="/earrings" className={navLinkClass}>
              {t("nav.earrings")}
            </Link>
            <Link href="/bracelets" className={navLinkClass}>
              {t("nav.bracelets")}
            </Link>
            <Link href="/rings" className={navLinkClass}>
              {t("nav.rings")}
            </Link>

            {/* Orders يظهر فقط للـ owner */}
            {isOwner && (
              <Link href="/owner/orders" className={navLinkClass + " relative"}>
                {t("nav.orders")}
                {newOrdersCount > 0 && (
                  <span
                    className="absolute -top-2 -end-4 text-white text-[10px] min-w-[18px] h-[18px] px-[6px] flex items-center justify-center rounded-full"
                    style={{ backgroundColor: GOLD, color: PRIMARY }}
                  >
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            )}

            {/* Owner Dashboard يظهر فقط للـ owner */}
            {isOwner && (
              <Link href="/owner-dashboard" className={navLinkClass}>
                {t("nav.dashboard")}
              </Link>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden text-napd-ink"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t("nav.menu")}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X size={26} strokeWidth={1.5} />
            ) : (
              <Menu size={26} strokeWidth={1.5} />
            )}
          </button>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-5 md:gap-8">
            {/* Language */}
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              aria-label={t("lang.switchLabel")}
              lang={lang === "ar" ? "en" : "ar"}
              className={`inline-flex h-9 min-w-[3rem] items-center justify-center rounded-full border border-napd-ink/15 px-3 text-napd-ink/75 transition-colors duration-200 hover:border-napd-ink hover:text-napd-ink ${
                lang === "ar"
                  ? "text-[11px] tracking-[0.18em] font-medium [font-family:var(--font-dm-sans)]"
                  : "text-[14px] [font-family:var(--font-ar-sans)]"
              }`}
            >
              {t("lang.switch")}
            </button>
            {/* Account / Login (desktop only) */}
            {!authLoading && !userId ? (
              <Link
                href="/login"
                className="napd-caps hidden lg:inline-flex items-center justify-center text-[12px] text-napd-ink/75 transition-colors duration-200 hover:text-napd-ink"
              >
                {t("nav.login")}
              </Link>
            ) : (
              <div className="hidden lg:block relative" ref={accountWrapRef}>
                <button
                  type="button"
                  disabled={authLoading}
                  className="napd-caps inline-flex items-center justify-center text-[12px] text-napd-ink/75 transition-colors duration-200 hover:text-napd-ink disabled:opacity-60"
                  onClick={() => {
                    if (!userId) {
                      router.push("/login");
                      return;
                    }
                    setIsAccountOpen((v) => !v);
                  }}
                  title={userId ? t("nav.account") : t("nav.login")}
                >
                  {authLoading ? "..." : displayName}
                </button>

                {userId && isAccountOpen && (
                  <div
                    className="absolute end-0 mt-3 w-44 overflow-hidden border border-napd-ink/10 bg-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)]"
                  >
                    <button
                      type="button"
                      className="napd-caps w-full text-start px-4 py-3 text-[12px] text-napd-ink/75 hover:text-napd-ink hover:bg-napd-paper transition-all"
                      onClick={handleLogout}
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative" aria-label={t("nav.cart")}>
              <ShoppingBag
                size={22}
                strokeWidth={1.5}
                className="text-napd-ink/80 hover:text-napd-ink transition-colors duration-200"
              />

              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -end-2 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: GOLD, color: PRIMARY }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div
          className="lg:hidden border-b border-napd-ink/10 bg-white px-6 py-7 space-y-6"
        >
          <Link
            href="/chains"
            className="napd-caps block text-[13px] text-napd-ink/80 hover:text-napd-ink"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.necklaces")}
          </Link>
          <Link
            href="/earrings"
            className="napd-caps block text-[13px] text-napd-ink/80 hover:text-napd-ink"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.earrings")}
          </Link>
          <Link
            href="/bracelets"
            className="napd-caps block text-[13px] text-napd-ink/80 hover:text-napd-ink"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.bracelets")}
          </Link>
          <Link
            href="/rings"
            className="napd-caps block text-[13px] text-napd-ink/80 hover:text-napd-ink"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.rings")}
          </Link>

          {/* Orders يظهر فقط للـ owner */}
          {isOwner && (
            <Link
              href="/owner/orders"
              className="napd-caps flex items-center justify-between text-[13px] text-napd-ink/80 hover:text-napd-ink"
              onClick={() => setIsOpen(false)}
            >
              <span>{t("nav.orders")}</span>
              {newOrdersCount > 0 && (
                <span
                  className="text-white text-[10px] min-w-[18px] h-[18px] px-[6px] flex items-center justify-center rounded-full"
                  style={{ backgroundColor: GOLD, color: PRIMARY }}
                >
                  {newOrdersCount}
                </span>
              )}
            </Link>
          )}

          {/* Owner Dashboard يظهر فقط للـ owner */}
          {isOwner && (
            <Link
              href="/owner-dashboard"
              className="napd-caps block text-[13px] text-napd-ink/80 hover:text-napd-ink"
              onClick={() => setIsOpen(false)}
            >
              {t("nav.dashboard")}
            </Link>
          )}

          {/* Login / Account + Logout */}
          {!authLoading && !userId ? (
            <Link
              href="/login"
              className="napd-pill w-full"
              onClick={() => setIsOpen(false)}
            >
              {t("nav.login")}
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-napd-muted">
                {authLoading ? "..." : displayName}
              </div>

              <button
                type="button"
                className="napd-pill w-full"
                onClick={handleLogout}
                disabled={authLoading}
              >
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
