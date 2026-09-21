import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { Input } from "./input";
import { cn } from "~/utils";

type Props = {
  label: string;
  /** Shown under the field. Stays in the markup so the layout never shifts. */
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * Label above, control, then hint or error below. The label is a real
 * `<label for>` rather than a wrapper, so clicking it focuses the input and
 * screen readers announce the hint through `aria-describedby`.
 */
const InputWithLabel = forwardRef<HTMLInputElement, Props>(
  (
    { label, hint, error, optional, containerClassName, id, ...inputProps },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedById = `${inputId}-description`;
    const description = error ?? hint;

    return (
      <div className={cn("flex flex-col gap-2", containerClassName)}>
        <label
          htmlFor={inputId}
          className="flex items-baseline gap-2 text-sm font-medium text-foreground"
        >
          {label}
          {optional ? (
            <span className="text-xs font-normal text-muted-foreground">
              optional
            </span>
          ) : null}
        </label>

        <Input
          {...inputProps}
          id={inputId}
          ref={ref}
          invalid={Boolean(error)}
          aria-describedby={description ? describedById : undefined}
        />

        {description ? (
          <p
            id={describedById}
            className={cn(
              "text-xs leading-relaxed",
              error ? "font-medium text-destructive" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    );
  }
);

InputWithLabel.displayName = "InputWithLabel";

export default InputWithLabel;
