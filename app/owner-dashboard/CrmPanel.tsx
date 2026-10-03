"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#123E38";

type Channel = "whatsapp" | "in_store" | "online";

type CustomerCrmRow = {
  id: string;
  name: string;
  phone: string;
  area: string | null;
  address: string | null;
  notes: string | null;
  legacy_order_count: number;
  legacy_total_spent: number;
  live_order_count: number;
  live_total_spent: number;
  total_order_count: number;
  total_spent: number;
  last_order_at: string | null;
  first_order_at: string | null;
  live_last_order_at: string | null;
  created_at: string;
};

type ProductLite = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

type LineItem = {
  key: string;
  product_id: string | null;
  title: string;
  unit_price: number;
  quantity: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function daysSince(dateStr: string | null) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr).getTime();
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
}

function segmentFor(row: CustomerCrmRow): {
  label: string;
  tone: "vip-active" | "vip-lapsed" | "new-active" | "one-time-lapsed" | "incomplete";
} {
  const count = row.total_order_count || 0;
  const days = daysSince(row.last_order_at);

  if (count === 0) return { label: "غير مكتمل", tone: "incomplete" };
  if (count >= 2) {
    return days <= 120
      ? { label: "VIP نشط", tone: "vip-active" }
      : { label: "VIP راكد", tone: "vip-lapsed" };
  }
  return days <= 120
    ? { label: "زبون جديد نشط", tone: "new-active" }
    : { label: "راكد مرة وحدة", tone: "one-time-lapsed" };
}

function toneColor(tone: string) {
  switch (tone) {
    case "vip-active":
      return { border: "#123E38", text: "#123E38", bg: "rgba(18,62,56,0.06)" };
    case "vip-lapsed":
      return { border: "#B08D57", text: "#8a6d3f", bg: "rgba(176,141,87,0.10)" };
    case "new-active":
      return { border: "#2563eb", text: "#1d4ed8", bg: "rgba(37,99,235,0.06)" };
    case "one-time-lapsed":
      return { border: "rgba(0,0,0,0.2)", text: "rgba(0,0,0,0.55)", bg: "rgba(0,0,0,0.02)" };
    default:
      return { border: "rgba(0,0,0,0.15)", text: "rgba(0,0,0,0.45)", bg: "transparent" };
  }
}

function formatMoney(n: number) {
  return (n || 0).toFixed(2);
}

export default function CrmPanel() {
  const [tab, setTab] = useState<"sale" | "customers">("sale");

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("sale")}
          className="px-4 py-3 rounded-full border text-xs uppercase tracking-widest transition-all bg-white"
          style={{
            borderColor: tab === "sale" ? PRIMARY : "rgba(0,0,0,0.15)",
            boxShadow: tab === "sale" ? "0 0 0 2px rgba(18,62,56,0.10)" : "none",
            color: tab === "sale" ? PRIMARY : "rgba(0,0,0,0.70)",
          }}
        >
          Log a Sale
        </button>
        <button
          type="button"
          onClick={() => setTab("customers")}
          className="px-4 py-3 rounded-full border text-xs uppercase tracking-widest transition-all bg-white"
          style={{
            borderColor: tab === "customers" ? PRIMARY : "rgba(0,0,0,0.15)",
            boxShadow: tab === "customers" ? "0 0 0 2px rgba(18,62,56,0.10)" : "none",
            color: tab === "customers" ? PRIMARY : "rgba(0,0,0,0.70)",
          }}
        >
          Customers
        </button>
      </div>

      {tab === "sale" ? <LogSaleForm /> : <CustomersTable />}
    </div>
  );
}

function LogSaleForm() {
  const [phone, setPhone] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerCrmRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCrmRow | null>(null);

  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");

  const [products, setProducts] = useState<ProductLite[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [productQuery, setProductQuery] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,quantity")
        .order("title", { ascending: true });
      if (!error && mounted) setProducts((data as ProductLite[]) || []);
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 20);
  }, [products, productQuery]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0),
    [items]
  );

  async function searchCustomer() {
    const q = phone.trim();
    if (!q) return;
    setSearching(true);
    const { data, error } = await supabase
      .from("customer_crm")
      .select("*")
      .or(`phone.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(10);
    setSearching(false);
    if (error) return alert(error.message || "Search failed");
    setSearchResults((data as CustomerCrmRow[]) || []);
  }

  function pickCustomer(c: CustomerCrmRow) {
    setSelectedCustomer(c);
    setSearchResults([]);
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setPhone("");
    setNewName("");
    setNewArea("");
    setNewAddress("");
  }

  function addLineItem(p?: ProductLite) {
    setItems((prev) => [
      ...prev,
      {
        key: uid(),
        product_id: p?.id || null,
        title: p?.title || "",
        unit_price: p?.price || 0,
        quantity: 1,
      },
    ]);
  }

  function updateLineItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeLineItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  async function submitSale() {
    if (!selectedCustomer && !phone.trim()) {
      return alert("Please search or create a customer first (phone number required)");
    }
    if (!items.length) return alert("Add at least one item");
    if (items.some((it) => !it.title.trim() || it.quantity <= 0)) {
      return alert("Each item needs a title and quantity > 0");
    }
    if (!staffName.trim()) return alert("Please enter staff name");

    setSaving(true);

    let customerId = selectedCustomer?.id || null;

    if (!customerId) {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: newName.trim() || phone.trim(),
          phone: phone.trim(),
          area: newArea.trim() || null,
          address: newAddress.trim() || null,
        })
        .select("id")
        .single();

      if (error) {
        setSaving(false);
        return alert(error.message || "Failed to create customer");
      }
      customerId = (data as { id: string })?.id || null;
    }

    const { data: saleRow, error: saleErr } = await supabase
      .from("sales")
      .insert({
        customer_id: customerId,
        channel,
        total,
        staff_name: staffName.trim(),
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (saleErr) {
      setSaving(false);
      return alert(saleErr.message || "Failed to log sale");
    }

    const saleId = (saleRow as { id: string })?.id;

    const itemRows = items.map((it) => ({
      sale_id: saleId,
      product_id: it.product_id,
      title: it.title.trim(),
      unit_price: it.unit_price,
      quantity: it.quantity,
      line_total: it.unit_price * it.quantity,
    }));

    const { error: itemsErr } = await supabase.from("sale_items").insert(itemRows);

    setSaving(false);

    if (itemsErr) {
      return alert(itemsErr.message || "Sale saved but items failed to save");
    }

    setSuccessMsg("Sale logged successfully. Stock updated.");
    setItems([]);
    setNotes("");
    clearCustomer();
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div
          className="border rounded-2xl px-5 py-4 text-sm"
          style={{ borderColor: PRIMARY, color: PRIMARY, backgroundColor: "rgba(18,62,56,0.05)" }}
        >
          {successMsg}
        </div>
      )}

      {/* Customer */}
      <div className="border rounded-2xl p-4 sm:p-6 bg-white">
        <h3 className="text-xs uppercase tracking-widest text-black/50 mb-4">Customer</h3>

        {selectedCustomer ? (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">{selectedCustomer.name}</div>
              <div className="text-xs text-black/50 mt-1">{selectedCustomer.phone}</div>
              {selectedCustomer.area && (
                <div className="text-xs text-black/50">{selectedCustomer.area}</div>
              )}
              <div className="text-xs text-black/45 mt-2">
                {selectedCustomer.total_order_count} previous orders ·{" "}
                {formatMoney(selectedCustomer.total_spent)} total
              </div>
            </div>
            <button
              type="button"
              onClick={clearCustomer}
              className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
              style={{ borderColor: "rgba(0,0,0,0.15)" }}
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Search by phone or name"
                className="flex-1 rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(0,0,0,0.15)" }}
              />
              <button
                type="button"
                onClick={searchCustomer}
                disabled={searching}
                className="px-5 py-3 rounded-full text-xs uppercase tracking-widest text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-xl divide-y overflow-hidden">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCustomer(c)}
                    className="w-full text-left px-4 py-3 hover:bg-black/[0.02] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-black/50">
                        {c.phone} · {c.area || "—"}
                      </div>
                    </div>
                    <div className="text-xs text-black/45">{c.total_order_count} orders</div>
                  </button>
                ))}
              </div>
            )}

            <div className="text-xs text-black/45">
              No match? Fill in the details below to create a new customer with this phone
              number.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name (new customer)"
                className="rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(0,0,0,0.15)" }}
              />
              <input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Area"
                className="rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(0,0,0,0.15)" }}
              />
              <input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Address"
                className="rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(0,0,0,0.15)" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Channel + staff */}
      <div className="border rounded-2xl p-4 sm:p-6 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-black/50">Channel</div>
          <div className="flex gap-2">
            {(["whatsapp", "in_store", "online"] as Channel[]).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className="flex-1 px-3 py-2 rounded-full text-[11px] uppercase tracking-widest border"
                style={{
                  borderColor: channel === ch ? PRIMARY : "rgba(0,0,0,0.15)",
                  color: channel === ch ? PRIMARY : "rgba(0,0,0,0.6)",
                  boxShadow: channel === ch ? "0 0 0 2px rgba(18,62,56,0.10)" : "none",
                }}
              >
                {ch === "whatsapp" ? "WhatsApp" : ch === "in_store" ? "In Store" : "Online"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-black/50">Staff Name</div>
          <input
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="Who is logging this sale?"
            className="w-full rounded-xl border px-4 py-3 outline-none"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-black/50">Notes (optional)</div>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes"
            className="w-full rounded-xl border px-4 py-3 outline-none"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="border rounded-2xl p-4 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-xs uppercase tracking-widest text-black/50">Items</h3>
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Search product to add"
            className="rounded-xl border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          />
        </div>

        {productQuery && (
          <div className="border rounded-xl divide-y overflow-hidden max-h-56 overflow-y-auto">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  addLineItem(p);
                  setProductQuery("");
                }}
                className="w-full text-left px-4 py-3 hover:bg-black/[0.02] flex items-center justify-between gap-4"
              >
                <span className="text-sm">{p.title}</span>
                <span className="text-xs text-black/45">
                  {formatMoney(p.price)} · stock {p.quantity}
                </span>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="px-4 py-3 text-sm text-black/45">No products found</div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => addLineItem()}
          className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
        >
          + Add custom item
        </button>

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.key}
                className="grid grid-cols-1 sm:grid-cols-[1fr_110px_110px_90px_auto] gap-3 items-center border rounded-xl p-3"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              >
                <input
                  value={it.title}
                  onChange={(e) => updateLineItem(it.key, { title: e.target.value })}
                  placeholder="Item title"
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                />
                <input
                  value={it.unit_price}
                  onChange={(e) =>
                    updateLineItem(it.key, { unit_price: Number(e.target.value) || 0 })
                  }
                  inputMode="decimal"
                  placeholder="Price"
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                />
                <input
                  value={it.quantity}
                  onChange={(e) =>
                    updateLineItem(it.key, { quantity: Number(e.target.value) || 0 })
                  }
                  inputMode="numeric"
                  placeholder="Qty"
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                />
                <div className="text-sm font-medium text-right sm:text-left">
                  {formatMoney(it.unit_price * it.quantity)}
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(it.key)}
                  className="px-3 py-2 rounded-full text-[11px] uppercase tracking-widest border hover:bg-black/[0.02]"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-xs uppercase tracking-widest text-black/50">Total</span>
          <span className="text-lg font-medium" style={{ color: PRIMARY }}>
            {formatMoney(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={submitSale}
        disabled={saving}
        className="w-full sm:w-auto px-6 py-3 rounded-full text-xs tracking-widest uppercase text-white"
        style={{ backgroundColor: PRIMARY }}
      >
        {saving ? "Saving…" : "Log Sale"}
      </button>
    </div>
  );
}

function CustomersTable() {
  const [rows, setRows] = useState<CustomerCrmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_crm")
        .select("*")
        .order("total_spent", { ascending: false });
      setLoading(false);
      if (error) return alert(error.message || "Failed to load customers");
      if (mounted) setRows((data as CustomerCrmRow[]) || []);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.area || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
        <h2 className="text-lg tracking-widest font-medium">CUSTOMERS</h2>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, area"
            className="rounded-xl border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          />
          <div className="text-xs uppercase tracking-widest text-black/50">
            {filtered.length} / {rows.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-black/50">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-black/50">No customers found</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-black/[0.02]">
              <tr className="text-left text-xs uppercase tracking-widest text-black/55">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Area</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Order</th>
                <th className="px-6 py-4">Segment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const seg = segmentFor(c);
                const colors = toneColor(seg.tone);
                return (
                  <tr key={c.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-black/45 mt-1">{c.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{c.area || "—"}</td>
                    <td className="px-6 py-4 text-sm">{c.total_order_count}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatMoney(c.total_spent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-2 rounded-full text-xs tracking-widest border"
                        style={{
                          borderColor: colors.border,
                          color: colors.text,
                          backgroundColor: colors.bg,
                        }}
                      >
                        {seg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
