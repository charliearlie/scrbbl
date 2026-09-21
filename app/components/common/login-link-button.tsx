import { Button } from "./button";
import { cn } from "~/utils";

type Props = {
  /** Where to land after Last.FM sends the browser back. */
  redirectTo?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
};

/**
 * A plain link to a server route that builds the Last.FM authorisation URL.
 * Nothing about the handshake happens in the browser any more, so this works
 * before hydration and no longer ships the API key in the client bundle.
 */
export default function LoginLinkButton({
  children = "Log in with Last.FM",
  className,
  redirectTo = "/",
  size = "default",
}: Props) {
  const href = `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <Button asChild size={size} className={cn("group", className)}>
      <a href={href}>{children}</a>
    </Button>
  );
}
