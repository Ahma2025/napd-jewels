import OccasionMotif from "./OccasionMotif";
import type { Motif } from "@/lib/occasion";

/** An engraved rule: hairlines that taper into a diamond, the motif at the centre. */
export function OccasionDivider({ motif, className = "" }: { motif: Motif; className?: string }) {
  return (
    <div aria-hidden="true" className={`napd-orn flex items-center justify-center gap-3 ${className}`}>
      <span className="napd-orn-line napd-orn-line--start h-px w-16 md:w-24" />
      <span className="h-[5px] w-[5px] rotate-45 border border-current" />
      <OccasionMotif motif={motif} strokeWidth={1.1} className="h-7 w-7" />
      <span className="h-[5px] w-[5px] rotate-45 border border-current" />
      <span className="napd-orn-line napd-orn-line--end h-px w-16 md:w-24" />
    </div>
  );
}

/**
 * A round seal, like the stamp on a maison's gift card: the motif in the
 * middle and a line of engraved capitals around it. Always set in Latin.
 */
export function OccasionSeal({
  motif,
  text,
  className = "",
  spin = true,
}: {
  motif: Motif;
  text: string;
  className?: string;
  spin?: boolean;
}) {
  const id = `seal-${motif}`;
  return (
    <div aria-hidden="true" className={`napd-seal ${className}`}>
      <svg viewBox="0 0 200 200" className={`h-full w-full ${spin ? "napd-seal-spin" : ""}`}>
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <text fill="currentColor" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11.5, letterSpacing: "0.42em" }}>
          <textPath href={`#${id}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <OccasionMotif motif={motif} strokeWidth={1} className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
