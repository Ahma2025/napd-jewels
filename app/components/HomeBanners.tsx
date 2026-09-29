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
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/BRACELETS/8fc61f4873d52819cd5282393.jpg",
  },
  {
    href: "/sets",
    label: "Sets",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/SETS/c430bd6594d72819cac3cdf2d.jpg",
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
  delay,
}: {
  href: string;
  label: string;
  image: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className="napd-tile-glow group relative block overflow-hidden rounded-xl aspect-[4/3] w-full sm:w-[calc(50%-13px)] lg:w-[calc(33.333%-17px)] ring-1 ring-[#B08D57]/25 hover:ring-[#B08D57]/60 shadow-[0_8px_24px_rgba(24,43,42,0.18)] transition-all duration-500"
      style={{
        background: "linear-gradient(160deg, #182B2A 0%, #0E1B1A 100%)",
        animationDelay: delay,
      }}
    >
      <div className="absolute inset-0 p-8 md:p-10 napd-tile-breathe" style={{ animationDelay: delay }}>
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* diagonal light sweep */}
      <span
        className="napd-tile-sweep pointer-events-none absolute inset-0"
        style={{ animationDelay: delay }}
      />

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
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>

      <div className="napd-tile-badge absolute right-4 bottom-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ animationDelay: delay }}>
        <span style={{ color: "#182B2A" }} className="text-sm leading-none">
          &#8599;
        </span>
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
        @keyframes napdTileBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.045); }
        }
        @keyframes napdTileGlow {
          0%, 100% { box-shadow: 0 8px 24px rgba(24,43,42,0.18), 0 0 0 rgba(176,141,87,0); }
          50% { box-shadow: 0 8px 24px rgba(24,43,42,0.18), 0 0 22px rgba(176,141,87,0.35); }
        }
        @keyframes napdTileSweep {
          0% { transform: translateX(-120%) translateY(-120%) rotate(20deg); opacity: 0; }
          8% { opacity: 0.35; }
          22% { opacity: 0; }
          100% { transform: translateX(120%) translateY(120%) rotate(20deg); opacity: 0; }
        }
        @keyframes napdBadgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(176,141,87,0.45); }
          50% { box-shadow: 0 0 0 6px rgba(176,141,87,0); }
        }
        .napd-tile-breathe {
          animation: napdTileBreathe 9s ease-in-out infinite;
        }
        .napd-tile-glow {
          animation: napdTileGlow 6s ease-in-out infinite;
        }
        .napd-tile-sweep {
          background: linear-gradient(115deg, transparent 40%, rgba(250,247,241,0.16) 50%, transparent 60%);
          animation: napdTileSweep 7s ease-in-out infinite;
        }
        .napd-tile-badge {
          animation: napdBadgePulse 3.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .napd-tile-breathe,
          .napd-tile-glow,
          .napd-tile-sweep,
          .napd-tile-badge {
            animation: none;
          }
        }
      `,
        }}
      />

      <div className="max-w-[1100px] mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "#B08D57" }}>
            The Edit
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl italic" style={{ color: "#182B2A" }}>
            Shop by Category
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {CATEGORIES.map((cat, i) => (
            <CategoryTile key={cat.label} {...cat} delay={`${i * 0.6}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
