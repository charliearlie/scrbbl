import { LoaderArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectTo");
  return json({
    frontendUrl: `${process.env.FRONTEND_URL}/auth-redirect?redirectTo=${redirectUrl}`,
  });
};

export default function Login() {
  const { frontendUrl } = useLoaderData<typeof loader>();
  return (
    <div className="mt-10">
      You have to log in to scrobble lad
      <Link
        to={`http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${frontendUrl}`}
        className="btn-error btn gap-4"
      >
        Login with Last.FM
      </Link>
    </div>
  );
}
