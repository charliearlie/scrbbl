import type { PropsWithChildren } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "~/utils";

type AlertVariant = "success" | "error" | "warning" | "info";

type Props = PropsWithChildren<{
  variant?: AlertVariant;
  title: string;
  className?: string;
}>;

const variants: Record<
  AlertVariant,
  { icon: typeof Info; panel: string; accent: string; role: "status" | "alert" }
> = {
  success: {
    icon: CheckCircle2,
    panel: "border-success/35 bg-success/10",
    accent: "text-success",
    role: "status",
  },
  error: {
    icon: AlertCircle,
    panel: "border-destructive/45 bg-destructive/10",
    accent: "text-destructive",
    role: "alert",
  },
  warning: {
    icon: TriangleAlert,
    panel: "border-warning/40 bg-warning/10",
    accent: "text-warning",
    role: "alert",
  },
  info: {
    icon: Info,
    panel: "border-border bg-raised",
    accent: "text-muted-foreground",
    role: "status",
  },
};

/**
 * Replaces the old DaisyUI `alert alert-*` markup. DaisyUI was dropped from
 * the Tailwind plugins a while back, so those classes resolved to nothing
 * and every success message rendered as unstyled text.
 *
 * Render this only when there is something to say. The previous version
 * stayed mounted behind `invisible`, which left a screen reader announcing
 * an empty live region.
 */
export default function Alert({
  children,
  className,
  title,
  variant = "success",
}: Props) {
  const { accent, icon: Icon, panel, role } = variants[variant];

  return (
    <div
      role={role}
      className={cn(
        "flex animate-rise-in items-start gap-3 rounded-md border p-4",
        panel,
        className
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-px h-5 w-5 shrink-0", accent)}
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {children ? (
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
