import { Star } from "lucide-react";
import { cn } from "~/utils";

/**
 * Ratings are stored 1..10 so five stars can carry halves. Shown as a row of
 * small filled marks rather than big glowing stars — it should read like
 * something pencilled on a sleeve.
 */
export default function Rating({
  className,
  rating,
}: {
  className?: string;
  rating: number | null;
}) {
  if (rating === null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Not rated
      </span>
    );
  }

  const full = Math.floor(rating / 2);
  const half = rating % 2 === 1;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating / 2} out of 5`}
      title={`${rating / 2} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < full;
        const isHalf = half && index === full;

        return (
          <Star
            aria-hidden="true"
            key={index}
            className={cn(
              "h-3.5 w-3.5",
              filled || isHalf ? "text-primary" : "text-border"
            )}
            fill={filled ? "currentColor" : "none"}
            strokeWidth={filled || isHalf ? 0 : 1.75}
            style={
              isHalf
                ? {
                    fill: "currentColor",
                    clipPath: "inset(0 50% 0 0)",
                  }
                : undefined
            }
          />
        );
      })}
    </span>
  );
}
