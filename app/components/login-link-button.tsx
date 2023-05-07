import { useEffect, useState } from "react";

export default function LoginLinkButton() {
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    const isBrowser = typeof window !== "undefined";
    console.log(isBrowser);
    if (isBrowser) {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth-redirect`;

      setRedirectUrl(redirectUrl);
    }
  }, []);

  return (
    <a
      href={`http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${redirectUrl}`}
      className="button button-danger gap-4"
    >
      Login with Last.FM
    </a>
  );
}
