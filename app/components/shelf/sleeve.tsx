import { Disc3 } from "lucide-react";

/**
 * One record. The depth is faked with a rotated spine band and a disc tucked
 * behind the cover rather than real geometry — at browsing size the illusion
 * holds, and it costs nothing next to a 3D engine.
 */
export default function Sleeve({
  artist,
  artworkUrl,
  backUrl = null,
  flipId,
  spine,
  spinning = false,
  title,
}: {
  artist: string;
  artworkUrl: string | null;
  /** The back of the sleeve, when the archive has a scan of it. */
  backUrl?: string | null;
  /** Given with a backUrl, the sleeve can be turned over. */
  flipId?: string;
  /** Colour pulled off the cover. Falls back to the surface colour. */
  spine?: string | null;
  spinning?: boolean;
  title: string;
}) {
  const flippable = Boolean(backUrl && flipId);

  return (
    <div
      className="sleeve crate-sleeve"
      style={spine ? ({ "--spine": spine } as React.CSSProperties) : undefined}
    >
      {flippable ? (
        <>
          <input className="sleeve-flip" id={flipId} type="checkbox" />
          <label className="sleeve-flip-label" htmlFor={flipId}>
            Turn it over
          </label>
        </>
      ) : null}
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

      {flippable ? (
        <div className="sleeve-face sleeve-back">
          <img
            alt={`Back of ${title}`}
            loading="lazy"
            src={backUrl ?? ""}
            draggable={false}
          />
          <span className="sleeve-sheen" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
