"use client";

import { supabase } from "./supabase";

// The second photo of each product, for the hover swap on product cards.
// Cards ask one by one; the requests are gathered into one query per frame.

const known = new Map<string, Promise<string | null>>();
let queue: { id: string; main: string | null; resolve: (url: string | null) => void }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  const batch = queue;
  queue = [];
  timer = null;
  const ids = [...new Set(batch.map((b) => b.id))];
  const { data } = await supabase
    .from("product_images")
    .select("product_id,image_url,sort_order")
    .in("product_id", ids)
    .order("sort_order", { ascending: true });
  const byProduct = new Map<string, string[]>();
  for (const row of (data as { product_id: string; image_url: string }[]) || []) {
    if (!row.image_url) continue;
    const list = byProduct.get(row.product_id) ?? [];
    list.push(row.image_url);
    byProduct.set(row.product_id, list);
  }
  for (const b of batch) {
    const other = (byProduct.get(b.id) ?? []).find((u) => u !== b.main);
    b.resolve(other ?? null);
  }
}

export function secondImage(id: string, main: string | null) {
  if (!known.has(id)) {
    known.set(
      id,
      new Promise((resolve) => {
        queue.push({ id, main, resolve });
        if (!timer) timer = setTimeout(flush, 30);
      })
    );
  }
  return known.get(id)!;
}
