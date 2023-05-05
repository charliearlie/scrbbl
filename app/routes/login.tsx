import { typedjson } from "remix-typedjson";
import LoginButton from "~/components/login-link-button";

export const loader = async () => {
  return typedjson({
    frontendUrl: `${process.env.FRONTEND_URL}/auth-redirect`,
  });
};

export default function Login() {
  const isBrowser = typeof window !== "undefined";

  // Get the origin, pathname, and search based on the environment
  const origin = isBrowser ? window.location.origin : "";
  const redirectUrl = `${origin}/auth-redirect`;

  return (
    <div className="mt-10">
      You have to log in to scrobble lad
      <LoginButton redirect={redirectUrl} />
    </div>
  );
}
