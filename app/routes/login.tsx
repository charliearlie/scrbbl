import { LoaderArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import LoginLinkButton from "~/components/common/login-link-button";

export const loader = async ({ request }: LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectTo");
  return json({
    redirectUrl: `redirectTo=${redirectUrl}`,
  });
};

export default function Login() {
  const { redirectUrl } = useLoaderData<typeof loader>();
  console.log("frontendUrl", redirectUrl);
  return (
    <div className="mt-10">
      You have to log in to scrobble lad
      <LoginLinkButton redirectTo={redirectUrl} />
    </div>
  );
}
