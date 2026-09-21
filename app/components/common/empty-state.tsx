import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  Icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
};

/** Nothing here yet, and a way forward. Never a blank panel. */
export default function EmptyState({
  children,
  description,
  Icon,
  title,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-raised text-muted-foreground">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold tracking-[-0.01em]">{title}</p>
        <p className="mx-auto max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
