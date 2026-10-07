"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { homepageOrder, inStock, type ListingProduct } from "./productDisplay";

const cache = new Map<string, Promise<ListingProduct[]>>();

function fetchCollection(categoryName: string) {
  const key = categoryName.toUpperCase();
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("name", key)
          .single();
        if (!cat?.id) return [];
        const { data, error } = await supabase
          .from("products")
          .select(
            "id,title,title_ar,price,final_price,has_discount,discount_percentage,image_url,created_at,quantity,is_featured,featured_at"
          )
          .eq("category_id", cat.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (error) {
          console.error(`Failed to load ${key}:`, error.message);
          return [];
        }
        return ((data as ListingProduct[]) || []).filter(inStock).sort(homepageOrder);
      })()
    );
  }
  return cache.get(key)!;
}

/** In-stock pieces of one category, shared between components on a page. */
export function useCollection(categoryName: string) {
  const [items, setItems] = useState<ListingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchCollection(categoryName).then((rows) => {
      if (!alive) return;
      setItems(rows);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [categoryName]);

  return { items, loading };
}
