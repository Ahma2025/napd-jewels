import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

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
    label: "Moissanite",
    image:
      "https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/882145ed4040e19ccb273db4.jpg",
  },
];

/** Each collection in its own lit niche, the same vitrine language as the hero. */
function CategoryNiche({
  href,
  label,
  image,
}: {
  href: string;
  label: string;
  image: string;
}) {
  return (
    <Link href={href} className="napd-cat group block text-center">
      <div className="relative mx-auto w-full">
        {/* outer gold hairline, set off the niche like a display case frame */}
        <span
          aria-hidden="true"
          className="napd-cat-frame pointer-events-none absolute -inset-2 rounded-t-[999px] rounded-b-[6px] border border-[#B08D57]/30 md:-inset-2.5"
        />
        <div className="napd-cat-niche relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[4px] bg-white">
          <div className="absolute inset-[14%]">
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 240px, 44vw"
              className="napd-card-img object-contain"
            />
          </div>
          <span aria-hidden="true" className="napd-niche-glow pointer-events-none absolute inset-0" />
          <span aria-hidden="true" className="napd-cat-sweep pointer-events-none absolute inset-0" />
        </div>
      </div>

      <h3 className="napd-display mt-7 text-[1.6rem] leading-none text-[#182B2A] md:text-[1.85rem]">
        {label}
      </h3>
      <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[#86663A]">
        Explore
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

export default function HomeBanners() {
  return (
    <section
      id="collection"
      className="relative w-full scroll-mt-24 overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: "#FAF7F1" }}
    >
      {/* a faint warm light falling on the shelf */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 0%, rgba(217,198,160,0.22) 0%, rgba(250,247,241,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-5 md:px-8">
        <Reveal className="mb-14 text-center md:mb-16">
          <h2 className="napd-display text-[clamp(2.6rem,5.5vw,4.25rem)] leading-[0.95] text-[#182B2A]">
            Shop by <span className="italic text-[#86663A]">collection</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:gap-x-10 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 90}>
              <CategoryNiche {...cat} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
