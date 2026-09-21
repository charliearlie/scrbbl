import * as React from "react";
import { cn } from "~/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Draws the field in its error state and hooks up the description. */
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2",
          // 16px stops iOS Safari zooming the viewport on focus.
          "text-base text-foreground md:text-[0.9375rem]",
          "transition-colors duration-200 ease-swift",
          "placeholder:text-muted-foreground",
          "hover:border-foreground/25",
          "focus-visible:ring-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          invalid &&
            "focus-visible:ring-destructive/35 border-destructive focus-visible:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
