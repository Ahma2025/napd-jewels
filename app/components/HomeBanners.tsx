import Image from "next/image";
import Link from "next/link";

export default function HomeBanners() {
  return (
    <section className="w-full py-16" style={{ backgroundColor: "#FAF7F1" }}>
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "#B08D57" }}>
            The Edit
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl italic" style={{ color: "#182B2A" }}>
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rings */}
          <Link
            href="/rings"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block"
          >
            <Image
              src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/RINGS/7d34e3af3c1c0819cabf6c5c2.jpg"
              alt="Rings"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background:
                  "linear-gradient(0deg, rgba(14,27,26,0.80) 0%, rgba(14,27,26,0.05) 60%)",
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white">
              <h3 className="text-3xl md:text-4xl italic mb-4" style={{ color: "#FAF7F1" }}>
                Rings
              </h3>

              <span
                className="px-7 py-2 border uppercase tracking-widest text-[11px] transition-all duration-300"
                style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
              >
                Shop Now
              </span>
            </div>
          </Link>

          {/* Necklaces */}
          <Link
            href="/chains"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block"
          >
            <Image
              src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/CHAINS/cb3e2e616f796819cd52db4f5.jpg"
              alt="Necklaces"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background:
                  "linear-gradient(0deg, rgba(14,27,26,0.80) 0%, rgba(14,27,26,0.05) 60%)",
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white">
              <h3 className="text-3xl md:text-4xl italic mb-4" style={{ color: "#FAF7F1" }}>
                Necklaces
              </h3>

              <span
                className="px-7 py-2 border uppercase tracking-widest text-[11px] transition-all duration-300"
                style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
              >
                Shop Now
              </span>
            </div>
          </Link>

          {/* Moissanite Edit — now a style/collection banner into Rings, not a separate category */}
          <Link
            href="/rings"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block md:col-span-2"
          >
            <Image
              src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/882145ed4040e19ccb273db4.jpg"
              alt="The Moissanite Edit"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background:
                  "linear-gradient(0deg, rgba(14,27,26,0.80) 0%, rgba(14,27,26,0.05) 60%)",
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white">
              <h3 className="text-3xl md:text-4xl italic mb-4" style={{ color: "#FAF7F1" }}>
                The Moissanite Edit
              </h3>

              <span
                className="px-7 py-2 border uppercase tracking-widest text-[11px] transition-all duration-300"
                style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
              >
                Shop Now
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
