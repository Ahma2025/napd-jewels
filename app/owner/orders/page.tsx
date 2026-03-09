"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Stage = "pending" | "confirmed" | "done";

type DbOrder = {
  id: string;
  created_at: string;
  status: string | null;

  customer_name: string | null;
  customer_phone: string | null;
  city: string | null;
  address: string | null;

  total: number | null;
};

type DbOrderItem = {
  id: string;
  order_id: string;

  title: string | null;
  unit_price: number | null;
  quantity: number | null;
  line_total: number | null;
  image_url: string | null;
};

type Profile = {
  role: "owner" | "customer" | null;
};

function formatMoney(n: number) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function stageFromStatus(s: string | null | undefined): Stage {
  const v = String(s || "")
    .trim()
    .toLowerCase();

  // DONE bucket (support multiple possible enum values)
  if (
    v === "done" ||
    v === "completed" ||
    v === "complete" ||
    v === "delivered" ||
    v === "shipped" ||
    v === "fulfilled" ||
    v === "success"
  )
    return "done";

  // CONFIRMED bucket (support multiple possible enum values)
  if (
    v === "confirmed" ||
    v === "confirm" ||
    v === "approved" ||
    v === "processing" ||
    v === "in_progress" ||
    v === "inprogress" ||
    v === "preparing"
  )
    return "confirmed";

  // default
  return "pending";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function OwnerOrdersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<DbOrder | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [activeItems, setActiveItems] = useState<DbOrderItem[]>([]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsItems, setAnalyticsItems] = useState<DbOrderItem[]>([]);

  const pending = useMemo(
    () => orders.filter((o) => stageFromStatus(o.status) === "pending"),
    [orders]
  );
  const confirmed = useMemo(
    () => orders.filter((o) => stageFromStatus(o.status) === "confirmed"),
    [orders]
  );
  const done = useMemo(
    () => orders.filter((o) => stageFromStatus(o.status) === "done"),
    [orders]
  );

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, created_at, status, customer_name, customer_phone, city, address, total"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setOrders([]);
      return;
    }

    setOrders((data as DbOrder[]) ?? []);
  }

  async function markSeen(uid: string) {
    await supabase
      .from("profiles")
      .update({ orders_last_seen_at: new Date().toISOString() })
      .eq("id", uid);
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;

      if (!mounted) return;

      setUserId(uid);

      if (!uid) {
        router.replace("/login");
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (!mounted) return;

      const prof = (p as Profile) ?? null;
      const owner = prof?.role === "owner";

      setIsOwner(owner);

      if (!owner) {
        router.replace("/");
        return;
      }

      await markSeen(uid);
      await loadOrders();

      setLoading(false);
    }

    boot();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Realtime updates
  useEffect(() => {
    if (!isOwner) return;

    const channel = supabase
      .channel("owner-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwner]);

  async function openItems(order: DbOrder) {
    setActiveOrder(order);
    setItemsLoading(true);
    setActiveItems([]);

    const { data, error } = await supabase
      .from("order_items")
      .select("id, order_id, title, unit_price, quantity, line_total, image_url")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (error) {
      setActiveItems([]);
      setItemsLoading(false);
      return;
    }

    setActiveItems((data as DbOrderItem[]) ?? []);
    setItemsLoading(false);
  }

  function closeModal() {
    setActiveOrder(null);
    setActiveItems([]);
    setPreviewUrl(null);
  }

  // Smart status update (fixes "Mark Done not moving" even if enum values differ)
  async function updateStatus(orderId: string, targetStage: Stage) {
    const prev = orders;

    // Optimistic UI: update stage using a synthetic status we map back to a stage
    const optimisticStatus = targetStage === "done" ? "done" : targetStage;
    setOrders((p) =>
      p.map((o) => (o.id === orderId ? { ...o, status: optimisticStatus } : o))
    );

    if (targetStage === "confirmed") {
      const { error } = await supabase.rpc("confirm_order_and_decrease_stock", {
        p_order_id: orderId,
      });

      if (!error) {
        setOrders((p) =>
          p.map((o) => (o.id === orderId ? { ...o, status: "confirmed" } : o))
        );
        return;
      }

      setOrders(prev);
      await loadOrders();
      return;
    }

    const candidates =
      targetStage === "done"
        ? ["done", "completed", "delivered"]
        : ["pending"];

    let success = false;

    for (const value of candidates) {
      const { error } = await supabase
        .from("orders")
        .update({ status: value })
        .eq("id", orderId);

      if (!error) {
        // Update local status to the real saved value
        setOrders((p) =>
          p.map((o) => (o.id === orderId ? { ...o, status: value } : o))
        );
        success = true;
        break;
      }
    }

    if (!success) {
      // rollback + refresh
      setOrders(prev);
      await loadOrders();
    }
  }

  // ===== Analytics =====
  const analyticsEligibleOrders = useMemo(() => {
    // count sales on confirmed + done (you can restrict to done only if you want)
    return orders.filter((o) => {
      const st = stageFromStatus(o.status);
      return st === "confirmed" || st === "done";
    });
  }, [orders]);

  const analyticsTotals = useMemo(() => {
    const ordersCount = analyticsEligibleOrders.length;
    const revenue = analyticsEligibleOrders.reduce(
      (acc, o) => acc + Number(o.total || 0),
      0
    );
    const aov = ordersCount > 0 ? revenue / ordersCount : 0;

    // last 7 days buckets (today included)
    const now = new Date();
    const buckets: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      buckets.push({ label: key, revenue: 0, orders: 0 });
    }

    const map = new Map(buckets.map((b) => [b.label, b]));
    for (const o of analyticsEligibleOrders) {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const b = map.get(key);
      if (b) {
        b.revenue += Number(o.total || 0);
        b.orders += 1;
      }
    }

    const maxRevenue = buckets.reduce((m, b) => Math.max(m, b.revenue), 0);

    return { ordersCount, revenue, aov, buckets, maxRevenue };
  }, [analyticsEligibleOrders]);

  async function loadAnalyticsItems() {
    // Load order_items only for eligible orders to keep it light
    const ids = analyticsEligibleOrders.map((o) => o.id);
    if (ids.length === 0) {
      setAnalyticsItems([]);
      return;
    }

    setAnalyticsLoading(true);

    const { data, error } = await supabase
      .from("order_items")
      .select("id, order_id, title, unit_price, quantity, line_total, image_url")
      .in("order_id", ids);

    if (error) {
      setAnalyticsItems([]);
      setAnalyticsLoading(false);
      return;
    }

    setAnalyticsItems((data as DbOrderItem[]) ?? []);
    setAnalyticsLoading(false);
  }

  useEffect(() => {
    if (!isOwner) return;
    // auto refresh analytics items whenever eligible order set changes
    loadAnalyticsItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, analyticsEligibleOrders.length]);

  const topProducts = useMemo(() => {
    const agg = new Map<string, { title: string; qty: number; revenue: number }>();

    for (const it of analyticsItems) {
      const title = (it.title || "Item").trim() || "Item";
      const qty = Number(it.quantity || 0);
      const rev = Number(it.line_total || 0);

      const cur = agg.get(title);
      if (!cur) {
        agg.set(title, { title, qty, revenue: rev });
      } else {
        cur.qty += qty;
        cur.revenue += rev;
      }
    }

    const arr = Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue);
    return arr.slice(0, 6);
  }, [analyticsItems]);

  const Column = ({
    title,
    hint,
    list,
  }: {
    title: string;
    hint: string;
    list: DbOrder[];
  }) => {
    return (
      <div className="rounded-2xl border border-black/10 bg-white">
        <div className="p-4 border-b border-black/10">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-widest uppercase text-black/70">
              {title}
            </div>
            <div className="text-xs text-black/40">{list.length}</div>
          </div>
          <div className="text-xs text-black/45 mt-1">{hint}</div>
        </div>

        <div className="p-4 space-y-3">
          {list.length === 0 ? (
            <div className="text-sm text-black/40 py-8 text-center">
              No orders here
            </div>
          ) : (
            list.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-black/10 p-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black/80 truncate">
                      {o.customer_name || "Customer"}
                    </div>
                    <div className="text-xs text-black/50 mt-1">
                      {o.customer_phone || "-"}
                    </div>
                    <div className="text-xs text-black/50">
                      {(o.city || "-") + (o.address ? ` • ${o.address}` : "")}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-black">
                      {formatMoney(o.total || 0)}
                    </div>
                    <div className="text-[11px] text-black/45 mt-1">
                      {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-xs uppercase tracking-wide border border-black/10 text-black/70 hover:border-black/20"
                    onClick={() => openItems(o)}
                  >
                    View Items
                  </button>

                  {stageFromStatus(o.status) === "pending" && (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs uppercase tracking-wide text-white bg-[#123E38] hover:opacity-90"
                      onClick={() => updateStatus(o.id, "confirmed")}
                    >
                      Confirm
                    </button>
                  )}

                  {stageFromStatus(o.status) === "confirmed" && (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs uppercase tracking-wide text-white bg-black hover:opacity-90"
                      onClick={() => updateStatus(o.id, "done")}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="text-sm text-black/60">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="text-2xl font-serif tracking-[0.12em] text-black">
            ORDERS
          </div>
          <div className="text-sm text-black/50 mt-2">
            Manage orders in 3 stages and keep everything organized.
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl border border-black/10 text-xs uppercase tracking-wide text-black/70 hover:border-black/20 w-full sm:w-auto"
          onClick={async () => {
            if (userId) await markSeen(userId);
            await loadOrders();
            await loadAnalyticsItems();
          }}
        >
          Refresh
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Column
          title="Pending"
          hint="New orders waiting for confirmation"
          list={pending}
        />
        <Column
          title="Confirmed"
          hint="Confirmed orders being prepared"
          list={confirmed}
        />
        <Column title="Done" hint="Completed orders" list={done} />
      </div>

      {/* Analytics */}
      <div className="mt-8 sm:mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <div className="text-xl font-serif tracking-[0.12em] text-black">
              ANALYTICS
            </div>
            <div className="text-sm text-black/50 mt-2">
              Sales summary based on Confirmed and Done orders.
            </div>
          </div>

          <div className="text-xs text-black/45">
            {analyticsLoading ? "Updating..." : ""}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-black/45">
              Revenue
            </div>
            <div className="mt-2 text-2xl font-semibold text-black">
              {formatMoney(analyticsTotals.revenue)}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-black/45">
              Orders
            </div>
            <div className="mt-2 text-2xl font-semibold text-black">
              {formatMoney(analyticsTotals.ordersCount)}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-black/45">
              Average Order
            </div>
            <div className="mt-2 text-2xl font-semibold text-black">
              {formatMoney(analyticsTotals.aov)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Last 7 days chart */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm tracking-widest uppercase text-black/70">
                Last 7 days
              </div>
              <div className="text-xs text-black/45">Revenue</div>
            </div>

            <div className="mt-4 space-y-3">
              {analyticsTotals.buckets.map((b) => {
                const max = analyticsTotals.maxRevenue || 1;
                const pct = clamp((b.revenue / max) * 100, 0, 100);

                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <div className="text-[11px] text-black/50 w-[92px] shrink-0">
                      {b.label.slice(5)}
                    </div>

                    <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#123E38",
                        }}
                      />
                    </div>

                    <div className="text-[11px] text-black/60 w-[88px] text-right shrink-0">
                      {formatMoney(b.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm tracking-widest uppercase text-black/70">
                Top products
              </div>
              <div className="text-xs text-black/45">By revenue</div>
            </div>

            <div className="mt-4">
              {topProducts.length === 0 ? (
                <div className="text-sm text-black/45 py-10 text-center">
                  No data yet
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p) => (
                    <div
                      key={p.title}
                      className="flex items-center justify-between gap-3 border border-black/10 rounded-xl p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-black/80 truncate">
                          {p.title}
                        </div>
                        <div className="text-xs text-black/50 mt-1">
                          Qty: {p.qty}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-black">
                          {formatMoney(p.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-[11px] text-black/45">
              Note: Analytics includes Confirmed and Done orders.
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-[720px] bg-white rounded-2xl overflow-hidden border border-black/10">
            <div className="p-4 border-b border-black/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-black/80">
                  Order Items
                </div>
                <div className="text-xs text-black/45 mt-1 truncate">
                  {activeOrder.customer_name || "Customer"} •{" "}
                  {formatMoney(activeOrder.total || 0)}
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-lg text-xs uppercase tracking-wide border border-black/10 text-black/70 hover:border-black/20"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <div className="p-4">
              {itemsLoading ? (
                <div className="text-sm text-black/60">Loading items...</div>
              ) : activeItems.length === 0 ? (
                <div className="text-sm text-black/50 text-center py-10">
                  No items found for this order.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((it) => (
                    <div
                      key={it.id}
                      className="rounded-xl border border-black/10 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        {it.image_url ? (
                          <button
                            type="button"
                            className="shrink-0 rounded-lg overflow-hidden border border-black/10 hover:border-black/20 transition"
                            onClick={() => setPreviewUrl(it.image_url)}
                            aria-label="Open image"
                          >
                            <img
                              src={it.image_url}
                              alt={it.title || "Item"}
                              className="w-[52px] h-[52px] object-cover"
                              loading="lazy"
                            />
                          </button>
                        ) : (
                          <div className="shrink-0 w-[52px] h-[52px] rounded-lg border border-black/10 bg-black/5" />
                        )}

                        <div className="min-w-0">
                          <div className="text-sm font-medium text-black/80 truncate">
                            {it.title || "Item"}
                          </div>
                          <div className="text-xs text-black/50 mt-1">
                            Qty: {it.quantity ?? 0} • Unit:{" "}
                            {formatMoney(it.unit_price || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {formatMoney(it.line_total || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-black/10 flex items-center justify-end gap-2">
              {stageFromStatus(activeOrder.status) === "pending" && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs uppercase tracking-wide text-white bg-[#123E38] hover:opacity-90"
                  onClick={async () => {
                    await updateStatus(activeOrder.id, "confirmed");
                    setActiveOrder((prev) =>
                      prev ? { ...prev, status: "confirmed" } : prev
                    );
                  }}
                >
                  Confirm
                </button>
              )}

              {stageFromStatus(activeOrder.status) === "confirmed" && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs uppercase tracking-wide text-white bg-black hover:opacity-90"
                  onClick={async () => {
                    await updateStatus(activeOrder.id, "done");
                    setActiveOrder((prev) =>
                      prev ? { ...prev, status: "done" } : prev
                    );
                  }}
                >
                  Mark Done
                </button>
              )}
            </div>
          </div>

          {previewUrl && (
            <div
              className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4"
              onClick={() => setPreviewUrl(null)}
            >
              <div
                className="relative max-w-[92vw] max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-black border border-black/10 shadow flex items-center justify-center hover:opacity-90"
                  onClick={() => setPreviewUrl(null)}
                  aria-label="Close"
                >
                  ×
                </button>

                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-[92vw] max-h-[92vh] rounded-2xl border border-white/10 object-contain bg-black"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}