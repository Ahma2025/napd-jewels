"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category =
  | "CHAINS"
  | "EARRINGS"
  | "BRACELETS"
  | "SETS"
  | "RINGS"
  | "PANDORA"
  | "MOISSANITE";

type Product = {
  id: string;
  category: Category;
  title: string;
  imageUrl: string; // MAIN image (sort_order = 0)
  price: number;
  quantity: number;
  discountPercent?: number; // optional
  isActive: boolean;
  createdAt: number; // for ordering (newest)
};

type DbCategory = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type DbProductView = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  has_discount: boolean | null;
  discount_percentage: number | null;
  final_price: number | null;
  image_url: string | null;
  main_image_url: string | null; // from view products_with_main_image
  category_id: string;
  is_active: boolean | null;
  created_at: string;
};

type DbProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type ParamKey =
  | "zircon_grade"
  | "main_stone_size"
  | "main_stone_shape"
  | "main_stone_cut"
  | "plating_color"
  | "main_stone_carat";

type DbProductParameter = {
  id: string;
  product_id: string;
  key: ParamKey;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const PRIMARY = "#123E38";

function displayCategoryLabel(cat: Category) {
  if (cat === "CHAINS") return "NECKLACES";
  return cat;
}

const CATEGORIES: { key: Category; label: string; hint: string }[] = [
  { key: "CHAINS", label: "NECKLACES", hint: "Manage necklaces products" },
  { key: "EARRINGS", label: "EARRINGS", hint: "Manage earrings products" },
  { key: "BRACELETS", label: "BRACELETS", hint: "Manage bracelets products" },
  { key: "SETS", label: "SETS", hint: "Manage sets products" },
  { key: "RINGS", label: "RINGS", hint: "Manage rings products" },
  { key: "PANDORA", label: "PANDORA", hint: "Manage Bandora products" },
  { key: "MOISSANITE", label: "MOISSANITE", hint: "Manage moissanite products" },
];

const PARAM_FIELDS: { key: ParamKey; label: string; placeholder?: string; sort: number }[] = [
  { key: "zircon_grade", label: "Zircon Grade", placeholder: "8A", sort: 0 },
  { key: "main_stone_size", label: "Main stone size", placeholder: "8MM*10MM", sort: 1 },
  { key: "main_stone_shape", label: "Main stone shape", placeholder: "Rectangle", sort: 2 },
  { key: "main_stone_cut", label: "Main stone cut", placeholder: "Radiant", sort: 3 },
  { key: "plating_color", label: "Plating color", placeholder: "18K", sort: 4 },
  { key: "main_stone_carat", label: "Main stone carat", placeholder: "4.0", sort: 5 },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function formatMoney(n: number) {
  // UI فقط: بدون عملة
  return n.toFixed(2);
}

function calcFinalPrice(price: number, discountPercent?: number) {
  if (!discountPercent || discountPercent <= 0) return price;
  const v = price * (1 - discountPercent / 100);
  return Math.max(0, v);
}

function normalizeCategory(v: string | null | undefined): Category | null {
  const x = (v || "").trim().toUpperCase();
  if (
    x === "CHAINS" ||
    x === "EARRINGS" ||
    x === "BRACELETS" ||
    x === "SETS" ||
    x === "RINGS" ||
    x === "PANDORA" ||
    x === "MOISSANITE"
  ) {
    return x as Category;
  }
  return null;
}

const EMPTY_PREVIEWS = ["", "", "", ""] as const;

export default function OwnerDashboardClient() {
  const [activeCat, setActiveCat] = useState<Category>("CHAINS");

  // DB-backed products (all categories)
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const categoriesById = useMemo(() => {
    const m: Record<string, DbCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const categoriesByKey = useMemo(() => {
    // map by normalized category name (CHAINS..)
    const m: Record<string, DbCategory> = {};
    for (const c of categories) {
      const key = normalizeCategory(c.name);
      if (key) m[key] = c;
    }
    return m;
  }, [categories]);

  // 4 inputs (one per slot) to keep order stable
  const fileRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<string>("10");

  // ✅ NEW: Product parameters (Product Parameters table)
  const [params, setParams] = useState<Record<ParamKey, string>>({
    zircon_grade: "",
    main_stone_size: "",
    main_stone_shape: "",
    main_stone_cut: "",
    plating_color: "",
    main_stone_carat: "",
  });

  // 4 images (slot 0 = main)
  const [imagePreviews, setImagePreviews] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [pickedFiles, setPickedFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);

  const catProducts = useMemo(() => {
    return products
      .filter((p) => p.category === activeCat)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [products, activeCat]);

  const finalPricePreview = useMemo(() => {
    const p = Number(price || 0);
    const d = hasDiscount ? Number(discountPercent || 0) : undefined;
    return calcFinalPrice(p, d);
  }, [price, hasDiscount, discountPercent]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: cats, error: catsErr } = await supabase
        .from("categories")
        .select("id,name,slug,description,image_url,is_active,created_at");

      if (catsErr) {
        alert(catsErr.message || "Failed to load categories");
        return;
      }

      if (!mounted) return;
      setCategories((cats as DbCategory[]) || []);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!categories.length) return;

    let mounted = true;

    async function loadProducts() {
      // IMPORTANT: use view that returns main_image_url (sort_order=0)
      const { data, error } = await supabase
        .from("products_with_main_image")
        .select(
          "id,title,price,quantity,has_discount,discount_percentage,final_price,image_url,main_image_url,category_id,is_active,created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        alert(
          error.message ||
            "Failed to load products. Make sure you created the view: products_with_main_image"
        );
        return;
      }

      const rows = (data as DbProductView[]) || [];
      const mapped: Product[] = rows
        .map((r) => {
          const catName = categoriesById[r.category_id]?.name;
          const cat = normalizeCategory(catName);
          if (!cat) return null;

          const d =
            r.has_discount && typeof r.discount_percentage === "number"
              ? r.discount_percentage
              : undefined;

          const main =
            (r.main_image_url && r.main_image_url.trim()) ||
            (r.image_url && r.image_url.trim()) ||
            "/hero.jpeg";

          return {
            id: r.id,
            category: cat,
            title: r.title,
            imageUrl: main,
            price: Number(r.price || 0),
            quantity: Number(r.quantity || 0),
            discountPercent: d,
            isActive: r.is_active !== false,
            createdAt: new Date(r.created_at).getTime(),
          } as Product;
        })
        .filter(Boolean) as Product[];

      if (!mounted) return;
      setProducts(mapped);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [categories.length, categoriesById]);

  function resetForm() {
    setTitle("");
    setPrice("");
    setQuantity("1");
    setHasDiscount(false);
    setDiscountPercent("10");
    setParams({
      zircon_grade: "",
      main_stone_size: "",
      main_stone_shape: "",
      main_stone_cut: "",
      plating_color: "",
      main_stone_carat: "",
    });
    setImagePreviews([...EMPTY_PREVIEWS]);
    setPickedFiles([null, null, null, null]);
    setEditingId(null);
    for (const r of fileRefs) if (r.current) r.current.value = "";
  }

  function onPickImageAt(index: number, file?: File) {
    if (!file) return;

    setPickedFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    const url = URL.createObjectURL(file);
    setImagePreviews((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  }

  function clearImageAt(index: number) {
    setPickedFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setImagePreviews((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    if (fileRefs[index]?.current) fileRefs[index].current!.value = "";
  }

  // ✅ NEW: clear all images with ONE button
  function clearAllImages() {
    setPickedFiles([null, null, null, null]);
    setImagePreviews([...EMPTY_PREVIEWS]);
    for (const r of fileRefs) if (r.current) r.current.value = "";
  }

  async function uploadFileToStorage(category: Category, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${category}/${uid()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
      });

    if (upErr) {
      alert(
        upErr.message ||
          "Image upload failed. Make sure you created a Storage bucket named: product-images"
      );
      return null;
    }

    const { data: pub } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return pub?.publicUrl || null;
  }

  async function uploadImagesIfNeeded(category: Category) {
    // returns urls ("" when empty)
    const urls: string[] = ["", "", "", ""];

    for (let i = 0; i < 4; i++) {
      const file = pickedFiles[i];
      const preview = imagePreviews[i];

      if (file) {
        const u = await uploadFileToStorage(category, file);
        if (!u) return null; // stop on failure
        urls[i] = u;
      } else {
        // existing URL (when editing) OR empty
        urls[i] = preview || "";
      }
    }

    return urls;
  }

  async function upsertProductImages(productId: string, imageUrls: string[]) {
    // Upsert existing urls, delete empties
    for (let i = 0; i < 4; i++) {
      const url = (imageUrls[i] || "").trim();

      if (url) {
        const { error } = await supabase
          .from("product_images")
          .upsert(
            {
              product_id: productId,
              image_url: url,
              sort_order: i,
            },
            { onConflict: "product_id,sort_order" }
          );

        if (error) {
          alert(error.message || "Failed to save product images");
          return false;
        }
      } else {
        // delete this slot if exists
        const { error } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId)
          .eq("sort_order", i);

        if (error) {
          alert(error.message || "Failed to delete product image slot");
          return false;
        }
      }
    }

    return true;
  }

  // ✅ NEW: load parameters for edit
  async function loadParametersForEdit(productId: string) {
    const { data, error } = await supabase
      .from("product_parameters")
      .select("id,product_id,key,value,sort_order,created_at,updated_at")
      .eq("product_id", productId);

    if (error) {
      return {
        zircon_grade: "",
        main_stone_size: "",
        main_stone_shape: "",
        main_stone_cut: "",
        plating_color: "",
        main_stone_carat: "",
      } as Record<ParamKey, string>;
    }

    const rows = (data as DbProductParameter[]) || [];
    const base: Record<ParamKey, string> = {
      zircon_grade: "",
      main_stone_size: "",
      main_stone_shape: "",
      main_stone_cut: "",
      plating_color: "",
      main_stone_carat: "",
    };

    for (const r of rows) {
      if (r?.key) base[r.key] = r.value || "";
    }

    return base;
  }

  // ✅ NEW: save parameters (upsert by product_id,key)
  async function saveProductParameters(productId: string) {
    const rows = PARAM_FIELDS.map((f) => ({
      product_id: productId,
      key: f.key,
      value: (params[f.key] || "").trim(),
      sort_order: f.sort,
    }));

    const filtered = rows.filter((r) => !!r.value);

    // delete all then insert filtered (clean + simple)
    const { error: delErr } = await supabase
      .from("product_parameters")
      .delete()
      .eq("product_id", productId);

    if (delErr) {
      alert(delErr.message || "Failed to clear product parameters");
      return false;
    }

    if (!filtered.length) return true;

    const { error: insErr } = await supabase.from("product_parameters").insert(filtered);

    if (insErr) {
      alert(insErr.message || "Failed to save product parameters");
      return false;
    }

    return true;
  }

  async function reloadProducts() {
    const { data, error } = await supabase
      .from("products_with_main_image")
      .select(
        "id,title,price,quantity,has_discount,discount_percentage,final_price,image_url,main_image_url,category_id,is_active,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert(
        error.message ||
          "Failed to load products. Make sure you created the view: products_with_main_image"
      );
      return;
    }

    const rows = (data as DbProductView[]) || [];
    const mapped: Product[] = rows
      .map((r) => {
        const catName = categoriesById[r.category_id]?.name;
        const cat = normalizeCategory(catName);
        if (!cat) return null;

        const d =
          r.has_discount && typeof r.discount_percentage === "number"
            ? r.discount_percentage
            : undefined;

        const main =
          (r.main_image_url && r.main_image_url.trim()) ||
          (r.image_url && r.image_url.trim()) ||
          "/hero.jpeg";

        return {
          id: r.id,
          category: cat,
          title: r.title,
          imageUrl: main,
          price: Number(r.price || 0),
          quantity: Number(r.quantity || 0),
          discountPercent: d,
          isActive: r.is_active !== false,
          createdAt: new Date(r.created_at).getTime(),
        } as Product;
      })
      .filter(Boolean) as Product[];

    setProducts(mapped);
  }

  async function addProduct() {
    const t = title.trim();
    const p = Number(price);
    const q = Number(quantity);

    if (!t) return alert("Please enter product title");
    if (!Number.isFinite(p) || p < 0) return alert("Please enter valid price");
    if (!Number.isFinite(q) || q < 0) return alert("Please enter valid quantity");

    // REQUIRE main image (slot 0)
    if (!imagePreviews[0]) return alert("Please upload MAIN product image (Image 1)");

    if (hasDiscount) {
      const d = Number(discountPercent);
      if (!Number.isFinite(d) || d <= 0 || d > 95) {
        return alert("Discount must be between 1 and 95");
      }
    }

    const catRow = categoriesByKey[activeCat];
    if (!catRow?.id) {
      return alert(
        "Category not found in database. Insert categories with names: CHAINS, EARRINGS, BRACELETS, SETS, RINGS, PANDORA"
      );
    }

    const uploadedUrls = await uploadImagesIfNeeded(activeCat);
    if (!uploadedUrls) return;

    const mainUrl = (uploadedUrls[0] || "").trim();

    const payload = {
      title: t,
      price: p,
      quantity: q,
      has_discount: hasDiscount,
      discount_percentage: hasDiscount ? Number(discountPercent) : 0,
      // keep for backward compatibility (and for old pages)
      image_url: mainUrl,
      category_id: catRow.id,
      is_active: true,
    };

    let productId = editingId;

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) return alert(error.message || "Failed to update product");
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();

      if (error) return alert(error.message || "Failed to add product");
      productId = (data as { id: string })?.id || null;
    }

    if (!productId) return alert("Failed to resolve product id");

    // Save 4 images to product_images
    const ok = await upsertProductImages(productId, uploadedUrls);
    if (!ok) return;

    // ✅ NEW: Save product parameters
    const okParams = await saveProductParameters(productId);
    if (!okParams) return;

    await reloadProducts();
    resetForm();
  }

  async function removeProduct(id: string) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert(error.message || "Failed to delete product");

    await reloadProducts();
    if (editingId === id) resetForm();
  }

  async function toggleActive(id: string) {
    const current = products.find((p) => p.id === id);
    if (!current) return;

    const { error } = await supabase
      .from("products")
      .update({ is_active: !current.isActive })
      .eq("id", id);

    if (error) return alert(error.message || "Failed to toggle product");

    await reloadProducts();
  }

  async function loadImagesForEdit(productId: string) {
    const { data, error } = await supabase
      .from("product_images")
      .select("id,product_id,image_url,sort_order,created_at")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) {
      // مش قاتل، بس بنخليها فاضية
      return ["", "", "", ""];
    }

    const rows = (data as DbProductImage[]) || [];
    const arr = ["", "", "", ""];

    for (const r of rows) {
      const i = Number(r.sort_order);
      if (i >= 0 && i < 4) arr[i] = r.image_url || "";
    }

    return arr;
  }

  async function quickEditTitle(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;

    setEditingId(p.id);
    setTitle(p.title);
    setPrice(String(p.price));
    setQuantity(String(p.quantity));
    setHasDiscount(!!p.discountPercent && p.discountPercent > 0);
    setDiscountPercent(String(p.discountPercent ?? 10));

    // ✅ NEW: load product parameters for edit
    const loadedParams = await loadParametersForEdit(p.id);
    setParams(loadedParams);

    // reset file inputs (editing uses existing URLs unless user uploads new files)
    setPickedFiles([null, null, null, null]);
    for (const r of fileRefs) if (r.current) r.current.value = "";

    const imgs = await loadImagesForEdit(p.id);

    // fallback: if no images found, at least show main from list (old data)
    const hasAny = imgs.some((x) => !!x);
    setImagePreviews(hasAny ? imgs : [p.imageUrl || "", "", "", ""]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function ProductCardsMobile({ items }: { items: Product[] }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {items.map((p) => {
          const final = calcFinalPrice(p.price, p.discountPercent);
          const hasD = !!p.discountPercent;

          return (
            <div key={p.id} className="border rounded-2xl overflow-hidden bg-white">
              <div className="flex gap-4 p-4">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden border bg-black/[0.02] shrink-0">
                  <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-black/45 mt-1">
                    {displayCategoryLabel(p.category)}
                  </div>

                  <div className="mt-3">
                    {hasD ? (
                      <div className="space-y-1">
                        <div className="text-xs text-black/45 line-through">
                          {formatMoney(p.price)}
                        </div>
                        <div className="text-sm font-medium" style={{ color: PRIMARY }}>
                          {formatMoney(final)}
                        </div>
                        <div className="text-xs text-black/45">{p.discountPercent}% off</div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium">{formatMoney(p.price)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-black/50">Qty</div>
                  <div className="text-sm">{p.quantity}</div>
                </div>

                <span
                  className="px-3 py-2 rounded-full text-xs uppercase tracking-widest border"
                  style={{
                    borderColor: p.isActive ? PRIMARY : "rgba(0,0,0,0.15)",
                    color: p.isActive ? PRIMARY : "rgba(0,0,0,0.55)",
                  }}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="border-t p-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => quickEditTitle(p.id)}
                  className="flex-1 px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => toggleActive(p.id)}
                  className="flex-1 px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                >
                  Toggle
                </button>

                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  className="flex-1 px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="bg-black/[0.03]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl tracking-widest font-medium">OWNER DASHBOARD</h1>
            <p className="text-sm text-black/55 mt-2">Add and manage products by category</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-black/50">
              Active Category
            </span>
            <span
              className="text-xs uppercase tracking-widest px-3 py-2 rounded-full border bg-white"
              style={{ borderColor: "rgba(0,0,0,0.15)" }}
            >
              {displayCategoryLabel(activeCat)}
            </span>
          </div>
        </div>

        {/* Mobile category tabs */}
        <div className="lg:hidden mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => {
              const active = c.key === activeCat;
              const count = products.filter((p) => p.category === c.key).length;

              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className="shrink-0 px-4 py-3 rounded-full border text-xs uppercase tracking-widest transition-all bg-white"
                  style={{
                    borderColor: active ? PRIMARY : "rgba(0,0,0,0.15)",
                    boxShadow: active ? "0 0 0 2px rgba(18,62,56,0.10)" : "none",
                    color: active ? PRIMARY : "rgba(0,0,0,0.70)",
                  }}
                >
                  {c.label} <span className="text-black/45">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:block border rounded-2xl p-4 h-fit bg-white">
            <div className="text-xs uppercase tracking-widest text-black/50 px-2">
              Categories
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {CATEGORIES.map((c) => {
                const active = c.key === activeCat;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveCat(c.key)}
                    className={[
                      "text-left rounded-xl px-4 py-3 border transition-all",
                      active ? "bg-black/[0.03]" : "hover:bg-black/[0.02]",
                    ].join(" ")}
                    style={{
                      borderColor: active ? PRIMARY : "rgba(0,0,0,0.12)",
                      boxShadow: active ? "0 0 0 2px rgba(18,62,56,0.12)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm tracking-widest font-medium">{c.label}</span>
                      <span className="text-xs text-black/45">
                        {products.filter((p) => p.category === c.key).length}
                      </span>
                    </div>
                    <div className="text-xs text-black/45 mt-1">{c.hint}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Content */}
          <section className="space-y-6 sm:space-y-8">
            {/* Add Product Card */}
            <div className="border rounded-2xl p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between gap-6">
                <h2 className="text-lg tracking-widest font-medium">
                  {editingId ? "EDIT PRODUCT" : "ADD PRODUCT"}
                </h2>
                <span className="text-xs uppercase tracking-widest text-black/50">
                  {displayCategoryLabel(activeCat)}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 mt-6">
                {/* Images upload (4) */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-widest text-black/50">
                    Product images (4) — Image 1 is MAIN
                  </div>

                  {/* Main preview */}
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border bg-black/[0.02]">
                    {imagePreviews[0] ? (
                      <Image src={imagePreviews[0]} alt="Main Preview" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-black/45">
                        No MAIN image selected
                      </div>
                    )}
                    <div className="absolute left-3 top-3 text-[11px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/90 border">
                      Main (1)
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => fileRefs[i].current?.click()}
                          className={[
                            "relative w-full aspect-square rounded-xl overflow-hidden border bg-black/[0.02] transition",
                            i === 0 ? "ring-2 ring-[rgba(18,62,56,0.20)]" : "",
                          ].join(" ")}
                          style={{ borderColor: "rgba(0,0,0,0.15)" }}
                          aria-label={`Upload image ${i + 1}`}
                        >
                          {imagePreviews[i] ? (
                            <Image src={imagePreviews[i]} alt={`Preview ${i + 1}`} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-black/45">
                              + {i + 1}
                            </div>
                          )}

                          <div className="absolute left-2 top-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/90 border">
                            {i + 1}
                          </div>
                        </button>

                        <input
                          ref={fileRefs[i]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onPickImageAt(i, e.target.files?.[0])}
                        />

                        {/* ✅ تعديل: شيلنا Clear من تحت كل صورة وخليّنا Upload بس */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileRefs[i].current?.click()}
                            className="flex-1 px-3 py-2 rounded-full text-[10px] tracking-widest uppercase border hover:bg-black/[0.02]"
                            style={{ borderColor: "rgba(0,0,0,0.15)" }}
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ زر Clear واحد آخر اشي يمسح كلشي */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="w-full px-5 py-3 rounded-full text-xs tracking-widest uppercase border transition-all hover:bg-black/[0.02]"
                      style={{ borderColor: "rgba(0,0,0,0.15)" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Title
                      </div>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Product title"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                        style={{
                          borderColor: "rgba(0,0,0,0.15)",
                          boxShadow: "none",
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Price
                      </div>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                        style={{
                          borderColor: "rgba(0,0,0,0.15)",
                          boxShadow: "none",
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Quantity
                      </div>
                      <input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        inputMode="numeric"
                        placeholder="0"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                        style={{
                          borderColor: "rgba(0,0,0,0.15)",
                          boxShadow: "none",
                        }}
                      />
                    </div>

                    {/* Discount toggle */}
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Discount
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setHasDiscount((v) => !v)}
                          className="px-4 py-3 rounded-xl border text-xs uppercase tracking-widest transition-all bg-white"
                          style={{
                            borderColor: hasDiscount ? PRIMARY : "rgba(0,0,0,0.15)",
                            boxShadow: hasDiscount ? "0 0 0 2px rgba(18,62,56,0.12)" : "none",
                          }}
                        >
                          {hasDiscount ? "Enabled" : "Disabled"}
                        </button>

                        {hasDiscount && (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(e.target.value)}
                              inputMode="numeric"
                              className="w-full rounded-xl border px-4 py-3 outline-none"
                              style={{ borderColor: "rgba(0,0,0,0.15)" }}
                              placeholder="10"
                            />
                            <span className="text-sm text-black/60">%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ NEW: Product Parameters */}
                  <div className="border rounded-2xl overflow-hidden">
                    <div className="px-4 py-4 bg-black/[0.02] border-b">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Product Parameters
                      </div>
                    </div>

                    <div className="divide-y">
                      {PARAM_FIELDS.map((f) => (
                        <div
                          key={f.key}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 px-4 py-4"
                        >
                          <div className="text-sm text-black/70">{f.label}</div>

                          <input
                            value={params[f.key]}
                            onChange={(e) =>
                              setParams((prev) => ({
                                ...prev,
                                [f.key]: e.target.value,
                              }))
                            }
                            placeholder={f.placeholder || ""}
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                            style={{
                              borderColor: "rgba(0,0,0,0.15)",
                              boxShadow: "none",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price preview */}
                  <div className="border rounded-2xl p-4 bg-black/[0.02]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs uppercase tracking-widest text-black/50">
                        Price preview
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-black/60">Base:</span>
                        <span className="text-sm font-medium">
                          {formatMoney(Number(price || 0))}
                        </span>

                        <span className="text-sm text-black/40">|</span>

                        <span className="text-sm text-black/60">Final:</span>
                        <span className="text-sm font-medium" style={{ color: PRIMARY }}>
                          {formatMoney(finalPricePreview)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={addProduct}
                      className="w-full sm:w-auto px-5 py-3 rounded-full text-xs tracking-widest uppercase text-white transition-all"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {editingId ? "Save Changes" : "Add Product"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-5 py-3 rounded-full text-xs tracking-widest uppercase border transition-all hover:bg-black/[0.02]"
                      style={{ borderColor: "rgba(0,0,0,0.15)" }}
                    >
                      {editingId ? "Cancel" : "Reset"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="border rounded-2xl overflow-hidden bg-white">
              <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4 border-b">
                <h2 className="text-lg tracking-widest font-medium">PRODUCTS</h2>
                <div className="text-xs uppercase tracking-widest text-black/50">
                  {catProducts.length} items
                </div>
              </div>

              {catProducts.length === 0 ? (
                <div className="p-10 text-center text-black/50">No products in this category</div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="block lg:hidden">
                    <ProductCardsMobile items={catProducts} />
                  </div>

                  {/* Desktop table */}
                  <div className="hidden lg:block w-full overflow-x-auto">
                    <table className="min-w-[900px] w-full">
                      <thead className="bg-black/[0.02]">
                        <tr className="text-left text-xs uppercase tracking-widest text-black/55">
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {catProducts.map((p) => {
                          const final = calcFinalPrice(p.price, p.discountPercent);
                          const hasD = !!p.discountPercent;

                          return (
                            <tr key={p.id} className="border-t">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-14 h-16 rounded-xl overflow-hidden border bg-black/[0.02]">
                                    <Image
                                      src={p.imageUrl}
                                      alt={p.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>

                                  <div>
                                    <div className="text-sm font-medium">{p.title}</div>
                                    <div className="text-xs text-black/45 mt-1">
                                      {displayCategoryLabel(p.category)}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {hasD ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-black/45 line-through">
                                      {formatMoney(p.price)}
                                    </div>
                                    <div className="text-sm font-medium" style={{ color: PRIMARY }}>
                                      {formatMoney(final)}
                                    </div>
                                    <div className="text-xs text-black/45">{p.discountPercent}% off</div>
                                  </div>
                                ) : (
                                  <div className="text-sm font-medium">{formatMoney(p.price)}</div>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-sm">{p.quantity}</div>
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className="px-3 py-2 rounded-full text-xs uppercase tracking-widest border"
                                  style={{
                                    borderColor: p.isActive ? PRIMARY : "rgba(0,0,0,0.15)",
                                    color: p.isActive ? PRIMARY : "rgba(0,0,0,0.55)",
                                  }}
                                >
                                  {p.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => quickEditTitle(p.id)}
                                    className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                                    style={{ borderColor: "rgba(0,0,0,0.15)" }}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleActive(p.id)}
                                    className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                                    style={{ borderColor: "rgba(0,0,0,0.15)" }}
                                  >
                                    Toggle
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removeProduct(p.id)}
                                    className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border hover:bg-black/[0.02]"
                                    style={{ borderColor: "rgba(0,0,0,0.15)" }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}