import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/utils";
import { isCurrent, navItems } from "./nav-items";

/**
 * The slim rail. Icon-only so the artwork gets the room, with the label
 * revealed on hover or keyboard focus; every control still carries an
 * accessible name whether or not that label is visible.
 */
export default function NavRail({ children }: { children?: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col items-center gap-1.5 border-r border-border bg-[hsl(240_10%_4%)] py-5 sm:flex"
    >
      <Link
        to="/"
        aria-label="Scrbbl home"
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-xl font-extrabold tracking-[-0.06em] text-primary-foreground transition-transform duration-300 ease-swift hover:scale-105 active:scale-95"
      >
        S
      </Link>

      {navItems.map(({ Icon, label, to }) => {
        const current = isCurrent(pathname, to);

        const content = (
          <>
            <Icon
              aria-hidden="true"
              className="h-[22px] w-[22px]"
              strokeWidth={1.6}
            />
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-[60px] z-30 whitespace-nowrap rounded-sm border border-border",
                "bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground",
                "opacity-0 shadow-lg transition-all duration-200 ease-swift",
                "-translate-x-1 group-hover:translate-x-0 group-hover:opacity-100",
                "group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              )}
            >
              {label}
              {!to ? (
                <span className="ml-1.5 text-muted-foreground">
                  not built yet
                </span>
              ) : null}
            </span>
          </>
        );

        const shell = cn(
          "group relative flex h-11 w-11 items-center justify-center rounded-md",
          "transition-colors duration-300 ease-swift",
          current
            ? "bg-raised text-primary bezel"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        );

        if (!to) {
          return (
            <span
              key={label}
              aria-disabled="true"
              aria-label={`${label}, not built yet`}
              tabIndex={0}
              className={cn(
                shell,
                "opacity-45 cursor-default hover:bg-transparent hover:text-muted-foreground"
              )}
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={label}
            to={to}
            aria-label={label}
            aria-current={current ? "page" : undefined}
            className={shell}
          >
            {content}
          </Link>
        );
      })}

      <span className="flex-1" />
      {children}
    </nav>
  );
}
