import { Form, Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { User } from "lastfmapi";
import { ArrowUpRight, LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/common/sheet";
import { Button } from "~/components/common/button";
import LoginLinkButton from "~/components/common/login-link-button";
import Avatar from "~/components/user/avatar";
import UserStats from "~/components/user/user-stats";
import { Badge } from "~/components/common/badge";
import { cn, formatCount } from "~/utils";
import { isCurrent, navItems } from "./nav-items";

export default function MobileNav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Navigating from inside the sheet should close it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const avatar =
    user?.image?.find((image) => image.size === "large")?.["#text"] ||
    undefined;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[min(20rem,85vw)] flex-col gap-6 border-border p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Main menu</SheetTitle>

        <div className="flex items-center gap-3 px-5 pt-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-lg font-extrabold tracking-[-0.06em] text-primary-foreground">
            S
          </span>
          <span className="text-xl font-extrabold tracking-[-0.045em]">
            Scrbbl
          </span>
        </div>

        <nav aria-label="Main" className="px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ Icon, label, to }) => {
              const current = isCurrent(pathname, to);

              if (!to) {
                return (
                  <li key={label}>
                    <span
                      aria-disabled="true"
                      className="opacity-55 flex items-center gap-3.5 rounded-md px-3 py-3 text-[0.9375rem] text-muted-foreground"
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={1.6}
                      />
                      <span className="flex-1">{label}</span>
                      <Badge variant="outline">Soon</Badge>
                    </span>
                  </li>
                );
              }

              return (
                <li key={label}>
                  <Link
                    to={to}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3.5 rounded-md px-3 py-3 text-[0.9375rem]",
                      "transition-colors duration-200 ease-swift",
                      current
                        ? "bezel bg-raised font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "h-5 w-5",
                        current ? "text-primary" : undefined
                      )}
                      strokeWidth={1.6}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border p-5">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avatar}
                  username={user.name}
                  className="h-11 w-11"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatCount(user.playcount)} scrobbles
                  </p>
                </div>
              </div>

              <UserStats user={user} />

              <div className="flex items-center justify-between gap-2">
                <Button asChild variant="ghost" size="sm">
                  <a href={user.url}>
                    Last.FM
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4"
                      strokeWidth={1.75}
                    />
                  </a>
                </Button>
                <Form method="post" action="/">
                  <Button type="submit" variant="ghost" size="sm">
                    Log out
                    <LogOut
                      aria-hidden="true"
                      className="h-4 w-4"
                      strokeWidth={1.75}
                    />
                  </Button>
                </Form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Scrbbl writes to your Last.FM profile, so it needs your
                permission first.
              </p>
              <LoginLinkButton redirectTo={pathname} className="w-full" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
