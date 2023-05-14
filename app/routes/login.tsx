import { typedjson } from "remix-typedjson";
import LoginButton from "~/components/common/login-link-button";

export const loader = async () => {
  return typedjson({
    frontendUrl: `${process.env.FRONTEND_URL}/auth-redirect`,
  });
};

export default function Login() {
  return (
    <div className="mt-10">
      You have to log in to scrobble lad
      <LoginButton />
    </div>
  );
}
