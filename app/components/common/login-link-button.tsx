import { useEffect, useState } from "react";
import { Button } from "./button";

export default function LoginLinkButton({
  redirectTo,
}: {
  redirectTo: string;
}) {
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth-redirect`;

      setRedirectUrl(redirectUrl);
    }
  }, []);

  return (
    <Button asChild>
      <a
        href={`http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${redirectUrl}?${redirectTo}`}
      >
        Login with Last.FM
      </a>
    </Button>
  );
}
