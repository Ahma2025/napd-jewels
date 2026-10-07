import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

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
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/BRACELETS/8fc61f4873d52819cd5282393.jpg",
  },
  {
    href: "/moissanite",
    label: "The Moissanite Edit",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/882145ed4040e19ccb273db4.jpg",
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
      className="napd-tile group relative block overflow-hidden rounded-xl aspect-[4/3] w-full sm:w-[calc(50%-12px)] ring-1 ring-[#B08D57]/25 hover:ring-[#B08D57]/60 shadow-[0_8px_24px_rgba(24,43,42,0.18)] transition-all duration-500"
      style={{
        background: "linear-gradient(160deg, #182B2A 0%, #0E1B1A 100%)",
      }}
    >
      <div className="absolute inset-0 p-8 md:p-10">
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* diagonal light sweep */}
      <span className="napd-tile-sweep pointer-events-none absolute inset-0" />

      {/* gradient scrim so the label stays legible over any product photo */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, rgba(10,17,16,0.85) 0%, rgba(10,17,16,0) 100%)" }}
      />

      <div className="absolute left-5 bottom-5">
        <h3
          className="text-lg md:text-xl font-semibold uppercase tracking-wide"
          style={{ color: "#FAF7F1" }}
        >
          {label}
        </h3>

        <span
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em]"
          style={{ color: "#D9C6A0" }}
        >
          Shop Now
          <ArrowRight
            aria-hidden="true"
            strokeWidth={1.5}
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
        </span>
      </div>

      <div className="absolute right-4 bottom-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110">
        <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-[#182B2A]" />
      </div>
    </Link>
  );
}

export default function HomeBanners() {
  return (
    <section className="w-full py-16" style={{ backgroundColor: "#FAF7F1" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes napdTileSweep {
          from { transform: translateX(-110%); }
          to { transform: translateX(110%); }
        }
        .napd-tile-sweep {
          background: linear-gradient(115deg, transparent 35%, rgba(250,247,241,0.14) 50%, transparent 65%);
          transform: translateX(-110%);
        }
        @media (hover: hover) {
          a:hover > .napd-tile-sweep {
            animation: napdTileSweep 900ms cubic-bezier(0.23, 1, 0.32, 1) both;
          }
        }
        a:focus-visible > .napd-tile-sweep {
          animation: napdTileSweep 900ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .napd-tile-sweep { display: none; }
        }
      `,
        }}
      />

      <div className="max-w-[920px] mx-auto px-5">
        <div className="text-center mb-10">
          <h2 className="napd-display text-4xl md:text-5xl italic" style={{ color: "#182B2A" }}>
            Shop by Category
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.label} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
