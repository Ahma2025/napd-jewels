import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full mt-1">
      <div className="relative w-full">
        <Image
          src="/hero.jpeg"
          alt="Hero"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}