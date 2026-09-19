import Image from "next/image";
import Link from "next/link";

export default function HomeBanners() {
  return (
    <section className="w-full bg-[#f5f5f5] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
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

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">Rings</h2>

              <span className="px-7 py-2 border border-white uppercase tracking-widest text-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
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

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">
                Necklaces
              </h2>

              <span className="px-7 py-2 border border-white uppercase tracking-widest text-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
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

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">
                The Moissanite Edit
              </h2>

              <span className="px-7 py-2 border border-white uppercase tracking-widest text-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
                Shop Now
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
