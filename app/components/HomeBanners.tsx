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
    href: "/bracelets",
    label: "Bracelets",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/BRACELETS/196ddffcb5d81819cd528286c.jpg",
  },
];

function CategoryTile({
  href,
  label,
  image,
}: {
  href: string;
  label: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative aspect-[3/4] overflow-hidden rounded-xl block ring-1 ring-[#B08D57]/25 hover:ring-[#B08D57]/60 shadow-[0_8px_24px_rgba(24,43,42,0.12)] transition-all duration-500"
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="(min-width: 640px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div
        className="absolute inset-x-0 bottom-0 backdrop-blur-md border-t px-4 py-4 flex flex-col items-center transition-all duration-500 group-hover:py-5"
        style={{ backgroundColor: "rgba(14,27,26,0.45)", borderColor: "rgba(176,141,87,0.3)" }}
      >
        <h3 className="text-lg md:text-xl italic" style={{ color: "#FAF7F1" }}>
          {label}
        </h3>

        <span
          className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em]"
          style={{ color: "#D9C6A0" }}
        >
          Shop Now
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}

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
            <CategoryTile key={cat.label} {...cat} />
          ))}
        </div>

        <Link
          href="/moissanite"
          className="group relative mt-5 md:mt-6 h-[220px] md:h-[300px] overflow-hidden rounded-xl block ring-1 ring-[#B08D57]/25 hover:ring-[#B08D57]/60 shadow-[0_8px_24px_rgba(24,43,42,0.12)] transition-all duration-500"
        >
          <Image
            src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/882145ed4040e19ccb273db4.jpg"
            alt="The Moissanite Edit"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div
            className="absolute inset-x-0 bottom-0 backdrop-blur-md border-t px-4 py-5 flex flex-col items-center transition-all duration-500 group-hover:py-6"
            style={{ backgroundColor: "rgba(14,27,26,0.45)", borderColor: "rgba(176,141,87,0.3)" }}
          >
            <h3 className="text-2xl md:text-3xl italic" style={{ color: "#FAF7F1" }}>
              The Moissanite Edit
            </h3>

            <span
              className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em]"
              style={{ color: "#D9C6A0" }}
            >
              Shop Now
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
