export default function LoginLinkButton() {
  const isBrowser = typeof window !== "undefined";

  const origin = isBrowser ? window.location.origin : "";
  const redirectUrl = `${origin}/auth-redirect`;
  return (
    <a
      href={`http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${redirectUrl}`}
      className="button button-danger gap-4"
    >
      Login with Last.FM
    </a>
  );
}
