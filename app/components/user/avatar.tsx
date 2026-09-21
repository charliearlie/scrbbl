import { cn } from "~/utils";

type Props = {
  src?: string;
  username: string;
  className?: string;
};

/**
 * Squircle rather than a circle, and it falls back to initials when Last.FM
 * hands back the empty-string image it uses for accounts with no picture.
 */
export default function Avatar({ className, src, username }: Props) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md",
        "border border-border bg-raised text-xs font-semibold text-foreground",
        className
      )}
    >
      {src ? (
        <img
          alt=""
          src={src}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
