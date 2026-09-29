import Image from "next/image";

const SPARKLES = [
  { left: "8%", top: "18%", size: 3, delay: "0s", duration: "4.5s" },
  { left: "18%", top: "32%", size: 2, delay: "1.1s", duration: "5.5s" },
  { left: "29%", top: "12%", size: 3, delay: "2.2s", duration: "4.8s" },
  { left: "41%", top: "26%", size: 2, delay: "0.6s", duration: "6s" },
  { left: "63%", top: "15%", size: 3, delay: "1.7s", duration: "5.2s" },
  { left: "74%", top: "30%", size: 2, delay: "2.8s", duration: "4.6s" },
  { left: "85%", top: "20%", size: 3, delay: "0.3s", duration: "5.8s" },
  { left: "93%", top: "34%", size: 2, delay: "1.4s", duration: "5s" },
];

export default function Hero() {
  return (
    <section className="relative w-full mt-1 overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes napdHeroKenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.045); }
        }
        @keyframes napdHeroTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        .napd-hero-zoom {
          animation: napdHeroKenBurns 24s ease-in-out infinite alternate;
        }
        .napd-hero-twinkle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, #FBF2DA 0%, #B08D57 65%, transparent 100%);
          animation: napdHeroTwinkle ease-in-out infinite;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .napd-hero-zoom { animation: none; }
          .napd-hero-twinkle { animation: none; opacity: 0.45; }
        }
      `,
        }}
      />

      <div className="relative w-full napd-hero-zoom">
        <Image
          src="/hero-green.jpeg"
          alt="NAPD Jewels"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* a few faint twinkles, confined to the dark upper portion so they
          never sit over the rings or the white text panel below */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "56%" }}
      >
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="napd-hero-twinkle"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>
    </section>
  );
}
