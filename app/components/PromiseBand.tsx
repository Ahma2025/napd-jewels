import { Gem, MessageCircle, ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";
import Spotlight from "./Spotlight";
import MaskHeading from "./MaskHeading";

const WHATSAPP_URL = "https://wa.me/972593255260";

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "One-year warranty",
    body: "Every piece is covered for a full year from the day it is yours.",
  },
  {
    icon: Gem,
    title: "Sterling silver 925",
    body: "Imported 925 silver and moissanite, checked piece by piece.",
  },
  {
    icon: MessageCircle,
    title: "Ordered personally",
    body: "Message us on WhatsApp and a real person helps you choose.",
  },
];

export default function PromiseBand() {
  return (
    <section className="relative overflow-hidden bg-[#182B2A] py-20 text-[#FAF7F1] md:py-24">
      <Spotlight />
      <div className="relative mx-auto max-w-[1100px] px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {PROMISES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 90} className="text-center md:text-left">
              <Icon aria-hidden="true" strokeWidth={1.25} className="mx-auto h-7 w-7 text-[#D9C6A0] md:mx-0" />
              <h3 className="napd-display mt-5 text-[1.75rem] leading-tight">{title}</h3>
              <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-[#FAF7F1]/65 md:mx-0">
                {body}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-6 border-t border-[#FAF7F1]/10 pt-14 text-center">
          <MaskHeading className="napd-display text-[clamp(2rem,4.5vw,3.25rem)] leading-tight">
            Looking for <span className="italic text-[#D9C6A0]">the one?</span>
          </MaskHeading>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="napd-btn inline-flex h-12 items-center gap-2 rounded-full bg-[#FAF7F1] px-7 text-[12px] uppercase tracking-[0.18em] text-[#182B2A]"
          >
            <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            Ask us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
