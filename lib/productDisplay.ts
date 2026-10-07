// Shared display helpers for product listings (homepage + category pages).

export type ListingProduct = {
  id: string;
  title: string;
  price: number;
  final_price: number | null;
  has_discount: boolean | null;
  discount_percentage: number | null;
  image_url: string | null;
  created_at: string;
  quantity: number | null;
  category_id?: string;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  featured_at?: string | null;
};

/** Owner-picked pieces first (in the order they were picked), then newest. */
export function homepageOrder(a: ListingProduct, b: ListingProduct) {
  const fa = !!a.is_featured;
  const fb = !!b.is_featured;
  if (fa !== fb) return fa ? -1 : 1;
  if (fa && fb) {
    return (
      new Date(a.featured_at || 0).getTime() - new Date(b.featured_at || 0).getTime()
    );
  }
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function inStock(p: { quantity: number | null }) {
  return Number(p.quantity || 0) > 0;
}

const shekel = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(n: number) {
  return `₪${shekel.format(Number(n || 0))}`;
}

export function priceInfo(p: ListingProduct) {
  const pct = Number(p.discount_percentage || 0);
  const hasDiscount = Boolean(p.has_discount) && pct > 0;
  const final = hasDiscount ? Number(p.final_price ?? p.price) : Number(p.price);
  return { hasDiscount, pct, original: Number(p.price), final };
}

// Many products were saved with only their category as the title
// ("RINGS", "NECKLACES"...). Show a readable name until real names are added.
const GENERIC_TITLES: Record<string, string> = {
  RINGS: "Sterling Silver Ring",
  RING: "Sterling Silver Ring",
  NECKLACES: "Sterling Silver Necklace",
  NECLACES: "Sterling Silver Necklace",
  NECKLACE: "Sterling Silver Necklace",
  CHAINS: "Sterling Silver Necklace",
  BRACELETS: "Sterling Silver Bracelet",
  BRACELETES: "Sterling Silver Bracelet",
  BRACELET: "Sterling Silver Bracelet",
  EARRINGS: "Sterling Silver Earrings",
  MOISSANITE: "Moissanite Ring",
  "MOISSANITE RING": "Moissanite Ring",
  "MIOSSANITE RING": "Moissanite Ring",
};

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function displayTitle(raw: string | null | undefined) {
  const t = (raw || "").trim();
  if (!t) return "Sterling Silver Piece";
  const key = t.toUpperCase().replace(/\s+/g, " ");
  if (GENERIC_TITLES[key]) return GENERIC_TITLES[key];
  // All-caps titles read as shouting in a listing; soften them.
  if (t === t.toUpperCase() && /[A-Z]/.test(t)) return titleCase(t);
  return t;
}
