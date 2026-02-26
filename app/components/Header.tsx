"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#123E38";

const navLinkClass =
  "relative uppercase text-[14px] tracking-wide text-black/70 transition-all duration-300 " +
  "hover:text-[#123E38] " +
  "hover:drop-shadow-[0_0_10px_rgba(18,62,56,0.35)] " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-[#123E38] " +
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
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const displayName = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (name) return name;
    return userId ? "Account" : "Login";
  }, [profile?.full_name, userId]);

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
    <header className="sticky top-0 z-50 bg-white border-b border-black/10">
      <div className="w-full px-6">
        <div className="h-20 flex items-center justify-between">
          {/* LEFT - DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/chains" className={navLinkClass}>
              Necklaces
            </Link>
            <Link href="/earrings" className={navLinkClass}>
              Earrings
            </Link>
            <Link href="/bracelets" className={navLinkClass}>
              Bracelets
            </Link>
            <Link href="/sets" className={navLinkClass}>
              Sets
            </Link>
            <Link href="/rings" className={navLinkClass}>
              Rings
            </Link>
            <Link href="/pandora" className={navLinkClass}>
              Pandora
            </Link>

            {/* Orders يظهر فقط للـ owner */}
            {isOwner && (
              <Link href="/owner/orders" className={navLinkClass + " relative"}>
                Orders
                {newOrdersCount > 0 && (
                  <span
                    className="absolute -top-2 -right-4 text-white text-[10px] min-w-[18px] h-[18px] px-[6px] flex items-center justify-center rounded-full"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            )}

            {/* Owner Dashboard يظهر فقط للـ owner */}
            {isOwner && (
              <Link href="/owner-dashboard" className={navLinkClass}>
                Owner Dashboard
              </Link>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X size={26} strokeWidth={1.5} />
            ) : (
              <Menu size={26} strokeWidth={1.5} />
            )}
          </button>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Account / Login (desktop only) */}
            {!authLoading && !userId ? (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full border border-black/10 text-[13px] uppercase tracking-wide text-black/70 transition-all duration-200 hover:text-[#123E38] hover:border-[#123E38]/40 hover:shadow-[0_0_18px_rgba(18,62,56,0.12)]"
              >
                Login
              </Link>
            ) : (
              <div className="hidden md:block relative" ref={accountWrapRef}>
                <button
                  type="button"
                  disabled={authLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-black/10 text-[13px] uppercase tracking-wide text-black/70 transition-all duration-200 hover:text-[#123E38] hover:border-[#123E38]/40 hover:shadow-[0_0_18px_rgba(18,62,56,0.12)] disabled:opacity-60"
                  onClick={() => {
                    if (!userId) {
                      router.push("/login");
                      return;
                    }
                    setIsAccountOpen((v) => !v);
                  }}
                  title={userId ? "Account" : "Login"}
                >
                  {authLoading ? "..." : displayName}
                </button>

                {userId && isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 text-[13px] uppercase tracking-wide text-black/70 hover:text-[#123E38] hover:bg-black/[0.02] transition-all"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingBag
                size={22}
                strokeWidth={1.5}
                className="text-black/70 hover:text-[#123E38] transition-colors duration-200"
              />

              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* LOGO */}
            <Link href="/" className="text-right">
              <div className="leading-tight text-center md:text-right">
                <div className="text-2xl font-serif tracking-[0.2em] text-black">
                  NAPD
                </div>
                <div className="text-[11px] tracking-[0.5em] text-black/60">
                  JEWELS
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-black/10 bg-white px-6 py-6 space-y-6">
          <Link
            href="/chains"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Necklaces
          </Link>
          <Link
            href="/earrings"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Earrings
          </Link>
          <Link
            href="/bracelets"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Bracelets
          </Link>
          <Link
            href="/sets"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Sets
          </Link>
          <Link
            href="/rings"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Rings
          </Link>
          <Link
            href="/pandora"
            className="block uppercase text-black/70 hover:text-[#123E38]"
            onClick={() => setIsOpen(false)}
          >
            Pandora
          </Link>

          {/* Orders يظهر فقط للـ owner */}
          {isOwner && (
            <Link
              href="/owner/orders"
              className="flex items-center justify-between uppercase text-black/70 hover:text-[#123E38]"
              onClick={() => setIsOpen(false)}
            >
              <span>Orders</span>
              {newOrdersCount > 0 && (
                <span
                  className="text-white text-[10px] min-w-[18px] h-[18px] px-[6px] flex items-center justify-center rounded-full"
                  style={{ backgroundColor: PRIMARY }}
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
              className="block uppercase text-black/70 hover:text-[#123E38]"
              onClick={() => setIsOpen(false)}
            >
              Owner Dashboard
            </Link>
          )}

          {/* Login / Account + Logout */}
          {!authLoading && !userId ? (
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl text-white uppercase tracking-wide"
              style={{ backgroundColor: PRIMARY }}
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-black/60">
                {authLoading ? "..." : displayName}
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl text-white uppercase tracking-wide"
                style={{ backgroundColor: PRIMARY }}
                onClick={handleLogout}
                disabled={authLoading}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}