import { cn, formatDuration } from "~/utils";

type Props = {
  artwork: string;
  title: string;
  subtitle: string;
  /** Year for an album, runtime for a song. */
  meta?: string;
  highlighted?: boolean;
};

export default function ResultRow({
  artwork,
  highlighted,
  meta,
  subtitle,
  title,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors duration-150",
        highlighted && "bg-accent"
      )}
    >
      <img
        alt=""
        src={artwork}
        width={44}
        height={44}
        loading="lazy"
        className="h-11 w-11 shrink-0 rounded-sm border border-border object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[0.9375rem] font-medium leading-snug">
          {title}
        </span>
        <span className="truncate text-[0.8125rem] leading-snug text-muted-foreground">
          {subtitle}
        </span>
      </span>
      {meta ? (
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export { formatDuration };
