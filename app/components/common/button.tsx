import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils";

/**
 * Shape rule for the whole app: interactive controls are pills, containers
 * carry the `lg` radius, inputs sit at `md`. Nothing mixes.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium tracking-[-0.01em]",
    "transition-all duration-300 ease-swift",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // A press should feel like it has mass.
    "active:scale-[0.98] active:duration-75",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-[0_8px_24px_hsl(var(--primary)/0.25)]",
        destructive:
          "bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent text-foreground hover:border-foreground/30 hover:bg-accent",
        secondary:
          "border border-border bg-raised text-raised-foreground bezel hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[0.9375rem]",
        sm: "h-10 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // A bare <button> inside a form defaults to submit. Be explicit.
        type={asChild ? undefined : type ?? "button"}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

/**
 * The trailing glyph on a primary call to action sits in its own well and
 * drifts on hover, so the button has some internal life. Pair with `group`
 * on the button.
 */
export function ButtonIcon({ children }: React.PropsWithChildren) {
  return (
    <span
      aria-hidden="true"
      className="-mr-2 ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/10 transition-transform duration-300 ease-swift group-hover:translate-x-0.5"
    >
      {children}
    </span>
  );
}

export { Button, buttonVariants };
