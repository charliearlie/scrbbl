import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "~/utils";

type Props = {
  /** Announced to screen readers; the box itself carries no visible label. */
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

/**
 * A real checkbox under a styled box, so keyboard, form state and screen
 * readers all behave. The album tracklist used to render a bare input with
 * an empty onChange handler, which looked interactive and was not.
 */
export default function Checkbox({ label, ...inputProps }: Props) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" {...inputProps} />
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-sm border border-input bg-card",
          "transition-colors duration-200 ease-swift",
          // The tick inherits currentColor: `peer-*` only reaches siblings,
          // never a descendant, so the colour has to live on this span.
          "text-transparent peer-hover:border-foreground/40",
          "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </label>
  );
}
