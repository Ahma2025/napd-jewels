import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #182B2A 0%, #0E1B1A 100%)" }}
    >
      {/* subtle gold glow accents */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(176,141,87,0.12)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(176,141,87,0.10)" }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div className="text-center md:text-left order-2 md:order-1">
          <span
            className="text-[11px] uppercase tracking-[0.35em]"
            style={{ color: "#B08D57" }}
          >
            Timeless Beauty
          </span>

          <h1
            className="mt-4 text-4xl md:text-5xl italic leading-[1.15]"
            style={{ color: "#FAF7F1", fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Crafted to
            <br />
            Perfection
          </h1>

          <p
            className="mt-5 text-sm md:text-base max-w-md mx-auto md:mx-0 leading-relaxed"
            style={{ color: "rgba(250,247,241,0.72)" }}
          >
            Discover NAPD&apos;s exquisite Moissanite jewelry, designed to celebrate life&apos;s most precious moments.
          </p>

          <Link
            href="/moissanite"
            className="mt-8 inline-flex items-center gap-2 border px-7 py-3 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 hover:bg-[#B08D57] hover:text-[#182B2A]"
            style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
          >
            Moissanite Collection
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Product image */}
        <div className="order-1 md:order-2 flex justify-center">
          <div
            className="relative w-[220px] h-[280px] md:w-[280px] md:h-[350px] rounded-2xl bg-white ring-1"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
          >
            <div className="absolute inset-0 rounded-2xl ring-1 ring-[#B08D57]/40 pointer-events-none" />
            <div className="absolute inset-4">
              <Image
                src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/de26702b9655f19ccb2863fb.jpg"
                alt="NAPD Moissanite Jewelry"
                fill
                sizes="(min-width: 768px) 280px, 220px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
