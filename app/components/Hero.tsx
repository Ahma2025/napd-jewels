import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #182B2A 0%, #0E1B1A 60%, #0A1413 100%)" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes napdDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          50% { transform: translate(40px, 30px) scale(1.25); opacity: 0.85; }
        }
        @keyframes napdDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate(-30px, -25px) scale(1.2); opacity: 0.75; }
        }
        @keyframes napdSparkle {
          0% { transform: translateY(0) scale(0.4); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.7; }
          100% { transform: translateY(-120px) scale(1); opacity: 0; }
        }
        @keyframes napdFloat3d {
          0%, 100% { transform: rotateX(6deg) rotateY(-8deg) translateY(0px); }
          50% { transform: rotateX(-4deg) rotateY(8deg) translateY(-14px); }
        }
        @keyframes napdSpinHalo {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes napdGlowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.08); }
        }
        @keyframes napdFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes napdShimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        .napd-fade-up { opacity: 0; animation: napdFadeUp 0.9s ease-out forwards; }
        .napd-particle { position: absolute; border-radius: 9999px; background: radial-gradient(circle, #F1DFB6 0%, #B08D57 70%, transparent 100%); animation: napdSparkle linear infinite; pointer-events: none; }
      `,
        }}
      />

      {/* animated gold glow blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(176,141,87,0.14)", animation: "napdDrift1 12s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(176,141,87,0.12)", animation: "napdDrift2 14s ease-in-out infinite" }}
      />

      {/* floating gold sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "6%", size: 4, delay: "0s", duration: "5.5s" },
          { left: "14%", size: 3, delay: "1.2s", duration: "6.5s" },
          { left: "23%", size: 5, delay: "2.4s", duration: "5s" },
          { left: "34%", size: 3, delay: "0.6s", duration: "7s" },
          { left: "47%", size: 4, delay: "3s", duration: "6s" },
          { left: "58%", size: 3, delay: "1.8s", duration: "5.8s" },
          { left: "67%", size: 5, delay: "0.3s", duration: "6.8s" },
          { left: "76%", size: 3, delay: "2.6s", duration: "5.2s" },
          { left: "85%", size: 4, delay: "1.4s", duration: "7.2s" },
          { left: "92%", size: 3, delay: "3.4s", duration: "6.2s" },
        ].map((p, i) => (
          <span
            key={i}
            className="napd-particle"
            style={{
              left: p.left,
              bottom: "-20px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1100px] mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div className="text-center md:text-left order-2 md:order-1">
          <span
            className="napd-fade-up inline-block text-[11px] uppercase tracking-[0.35em]"
            style={{ color: "#B08D57", animationDelay: "0.1s" }}
          >
            Timeless Beauty
          </span>

          <h1
            className="napd-fade-up mt-4 text-4xl md:text-6xl italic leading-[1.15]"
            style={{
              color: "#FAF7F1",
              fontFamily: 'Georgia, "Times New Roman", serif',
              animationDelay: "0.3s",
              textShadow: "0 0 40px rgba(176,141,87,0.25)",
            }}
          >
            Crafted to
            <br />
            Perfection
          </h1>

          <p
            className="napd-fade-up mt-5 text-sm md:text-base max-w-md mx-auto md:mx-0 leading-relaxed"
            style={{ color: "rgba(250,247,241,0.72)", animationDelay: "0.5s" }}
          >
            Discover NAPD&apos;s exquisite Moissanite jewelry, designed to celebrate life&apos;s most precious moments.
          </p>

          <div className="napd-fade-up" style={{ animationDelay: "0.7s" }}>
            <Link
              href="/moissanite"
              className="relative mt-8 inline-flex items-center gap-2 overflow-hidden border px-7 py-3 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 hover:bg-[#B08D57] hover:text-[#182B2A]"
              style={{ borderColor: "#B08D57", color: "#D9C6A0" }}
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  animation: "napdShimmer 3.2s ease-in-out infinite",
                }}
              />
              <span className="relative">Moissanite Collection</span>
              <span className="relative">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Product image â animated 3D showcase */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative" style={{ perspective: "1200px" }}>
            {/* pulsing glow behind everything */}
            <div
              className="pointer-events-none absolute inset-0 -m-8 rounded-full blur-2xl"
              style={{ backgroundColor: "rgba(176,141,87,0.35)", animation: "napdGlowPulse 4s ease-in-out infinite" }}
            />

            {/* rotating gold halo ring */}
            <div
              className="pointer-events-none absolute -inset-5 md:-inset-6 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, #B08D57 15%, transparent 35%, transparent 55%, #F1DFB6 70%, transparent 90%)",
                animation: "napdSpinHalo 9s linear infinite",
                opacity: 0.8,
              }}
            />
            <div
              className="pointer-events-none absolute -inset-2 rounded-full border"
              style={{ borderColor: "rgba(176,141,87,0.3)" }}
            />

            {/* 3D floating card */}
            <div
              className="relative w-[220px] h-[280px] md:w-[300px] md:h-[380px] rounded-2xl bg-white ring-1"
              style={{
                boxShadow: "0 25px 60px rgba(0,0,0,0.45), 0 0 40px rgba(176,141,87,0.15)",
                animation: "napdFloat3d 6s ease-in-out infinite",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="absolute inset-0 rounded-2xl ring-1 ring-[#B08D57]/40 pointer-events-none" />
              <div className="absolute inset-4">
                <Image
                  src="https://otkgofsblfouiauwqlbj.supabase.co/storage/v1/object/public/product-images/products/MOISSANITE/de26702b9655f19ccb2863fb.jpg"
                  alt="NAPD Moissanite Jewelry"
                  fill
                  sizes="(min-width: 768px) 300px, 220px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
