import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { Clock } from "lucide-react";
import { cn, toDateTimeLocalValue } from "~/utils";

export type WhenPreset = {
  label: string;
  /** Built on click, in the viewer's timezone. */
  resolve: () => Date;
};

export const justNow: WhenPreset = {
  label: "Just now",
  resolve: () => new Date(),
};

export const anHourAgo: WhenPreset = {
  label: "An hour ago",
  resolve: () => new Date(Date.now() - 60 * 60 * 1000),
};

export const lastNight: WhenPreset = {
  label: "Last night",
  resolve: () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(22, 0, 0, 0);
    return date;
  },
};

type Props = {
  label: string;
  /** Empty string means "now", resolved at the moment of submitting. */
  value: string;
  onChange: (value: string) => void;
  name?: string;
  presets?: WhenPreset[];
  error?: string | null;
  /**
   * Renders under the control. Receives null until the client knows what
   * "now" is, so callers must return the same element shape either way.
   */
  describe?: (resolved: Date | null) => ReactNode;
  className?: string;
};

/**
 * Replaces the bare `datetime-local` box. A scrobble's whole point is the
 * timestamp, so the common answers are one tap and the exact time is still
 * there underneath.
 *
 * An empty value means "now" and stays empty until the user picks something,
 * so the server and the client never disagree about the current time during
 * hydration.
 */
export default function WhenField({
  className,
  describe,
  error,
  label,
  name = "datetime",
  onChange,
  presets = [justNow, anHourAgo, lastNight],
  value,
}: Props) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  // "Now" only exists on the client. Holding it in state keeps the first
  // render identical on both sides.
  const [resolvedNow, setResolvedNow] = useState<Date | null>(null);
  useEffect(() => {
    setResolvedNow(value ? new Date(value) : new Date());
  }, [value]);

  const activePreset = value === "" ? presets[0]?.label : null;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock
          aria-hidden="true"
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.75}
        />
        {label}
      </span>

      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = preset.label === activePreset;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                onChange(
                  preset === presets[0]
                    ? ""
                    : toDateTimeLocalValue(preset.resolve())
                )
              }
              className={cn(
                "h-9 rounded-full border px-3.5 text-[0.8125rem] font-medium",
                "transition-all duration-300 ease-swift active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-raised text-foreground hover:border-foreground/25 hover:bg-accent"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-muted-foreground"
        >
          Or pick the exact time
        </label>
        <input
          id={inputId}
          name={name}
          type="datetime-local"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={cn(
            "h-11 w-full rounded-md border border-input bg-card px-3.5",
            "font-mono text-base tabular-nums text-foreground md:text-sm",
            "transition-colors duration-200 ease-swift",
            "hover:border-foreground/25",
            "focus-visible:ring-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2",
            error && "border-destructive focus-visible:border-destructive"
          )}
        />
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : describe ? (
        // Always rendered, on the server too. Inserting this after mount
        // moved the nodes React was still hydrating and broke the page's
        // hydration outright.
        <p className="text-xs leading-relaxed text-muted-foreground">
          {describe(resolvedNow)}
        </p>
      ) : null}
    </div>
  );
}
