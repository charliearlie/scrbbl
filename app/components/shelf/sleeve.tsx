import { Disc3 } from "lucide-react";

/**
 * One record. The depth is faked with a rotated spine band and a disc tucked
 * behind the cover rather than real geometry — at browsing size the illusion
 * holds, and it costs nothing next to a 3D engine.
 */
export default function Sleeve({
  artist,
  artworkUrl,
  spine,
  spinning = false,
  title,
}: {
  artist: string;
  artworkUrl: string | null;
  /** Colour pulled off the cover. Falls back to the surface colour. */
  spine?: string | null;
  spinning?: boolean;
  title: string;
}) {
  return (
    <div
      className="sleeve crate-sleeve"
      style={spine ? ({ "--spine": spine } as React.CSSProperties) : undefined}
    >
      <span
        className="sleeve-disc"
        data-spinning={spinning}
        aria-hidden="true"
      />
      <span className="sleeve-spine" aria-hidden="true" />

      <div className="sleeve-face">
        {artworkUrl ? (
          <img
            alt={`${title} by ${artist}`}
            loading="lazy"
            src={artworkUrl}
            draggable={false}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-raised text-muted-foreground">
            <Disc3 aria-hidden="true" className="h-10 w-10" strokeWidth={1.4} />
          </span>
        )}
        <span className="sleeve-sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
