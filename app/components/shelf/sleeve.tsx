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
        {/* Behind the artwork, so a sleeve with no scan — or one whose URL
            has rotted — shows this rather than a broken-image glyph. */}
        <span className="sleeve-placeholder" aria-hidden="true">
          <Disc3 className="h-10 w-10" strokeWidth={1.4} />
        </span>
        {artworkUrl ? (
          <img
            alt={`${title} by ${artist}`}
            loading="lazy"
            src={artworkUrl}
            draggable={false}
            // CSS hides the alt text but not the browser's own broken-image
            // glyph. Without JavaScript you get a small mark in the corner;
            // with it, the placeholder underneath is all you see.
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : null}
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
