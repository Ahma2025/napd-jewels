import type { Motif } from "@/lib/occasion";

/** Line-drawn motifs on a 48×48 grid, stroked in the occasion's accent. */
const PATHS: Record<Motif, string> = {
  crescent:
    "M30 8a17 17 0 1 0 0 32a13.5 13.5 0 1 1 0-32Z M36.5 15.5l1.4 3.2 3.4.3-2.6 2.2.8 3.4-3-1.8-3 1.8.8-3.4-2.6-2.2 3.4-.3Z",
  heart:
    "M24 40C14 32.5 7 26.5 7 18.5A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 17 4.5C41 26.5 34 32.5 24 40Z",
  flower:
    "M18.0 15.5a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M26.1 21.4a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M23.0 30.9a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M13.0 30.9a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M9.9 21.4a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M20.5 24a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0Z",
  // the star of Bethlehem: four points, the lower one long
  star: "M24 5L27 18L37 21L27 24L24 44L21 24L11 21L21 18Z M38 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z",
  tag: "M8 24V10a2 2 0 0 1 2-2h14l17 17-16 16L8 24Z M16 16a2.5 2.5 0 1 0 0 .1Z",
  rings:
    "M19 20a11 11 0 1 0 0 22a11 11 0 1 0 0-22Z M29 20a11 11 0 1 0 0 22a11 11 0 1 0 0-22Z M29 20l-3-6h6Z",
  cap: "M4 19l20-9 20 9-20 9-20-9Z M12 23v8c0 3 5.5 6 12 6s12-3 12-6v-8 M44 19v10",
};

export default function OccasionMotif({
  motif,
  className,
  strokeWidth = 1.2,
}: {
  motif: Motif;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[motif]} />
    </svg>
  );
}

/** The motif as a tiled CSS background (for a faint pattern behind the band). */
export function motifPattern(motif: Motif, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><g fill="none" stroke="${color}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" transform="translate(24 24) scale(1)"><path d="${PATHS[motif]}"/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
