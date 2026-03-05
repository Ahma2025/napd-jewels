import Image from "next/image";
import Link from "next/link";

export default function HomeBanners() {
  return (
    <section className="w-full bg-[#f5f5f5] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sets */}
          <Link
            href="/sets"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block"
          >
            <Image
              src="/set.png"
              alt="Sets"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">Sets</h2>

              <span className="px-7 py-2 border border-white uppercase tracking-widest text-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Bandora */}
          <Link
            href="/pandora"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block"
          >
            <Image
              src="/bandora.png"
              alt="Bandora Silver"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">
                Bandora Silver
              </h2>

              <span className="px-7 py-2 border border-white uppercase tracking-widest text-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Moissanite */}
          <Link
            href="/moissanite"
            className="group relative h-[300px] md:h-[260px] overflow-hidden rounded-lg cursor-pointer block md:col-span-2"
          >
            <Image
              src="/mosissanite.png"
              alt="Moissanite"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-5">
                Moissanite
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