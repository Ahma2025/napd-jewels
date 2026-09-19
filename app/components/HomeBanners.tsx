import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    href: "/rings",
    label: "Rings",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/RINGS/7d34e3af3c1c0819cabf6c5c2.jpg",
  },
  {
    href: "/chains",
    label: "Necklaces",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/CHAINS/cb3e2e616f796819cd52db4f5.jpg",
  },
  {
    href: "/rings",
    label: "The Moissanite Edit",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/882145ed4040e19ccb273db4.jpg",
  },
];

export default function HomeBanners() {
  return (
    <section className="w-full py-16" style={{ backgroundColor: "#FAF7F1" }}>
      <div className="max-w-[1100px] mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "#B08D57" }}>
            The Edit
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl italic" style={{ color: "#182B2A" }}>
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl cursor-pointer block shadow-[0_8px_24px_rgba(24,43,42,0.12)]"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(14,27,26,0.78) 0%, rgba(14,27,26,0.05) 55%)",
                }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-white">
                <h3 className="text-xl md:text-2xl italic mb-3 text-center px-4" style={{ color: "#FAF7F1" }}>
                  {cat.label}
                </h3>

                <span
                  className="px-5 py-1.5 border uppercase tracking-widest text-[10px] transition-all duration-300 group-hover:bg-[#B08D57]/10"
                  style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
                >
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
