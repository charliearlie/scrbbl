import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/common/card";
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
    <main className="container mt-12 bg-background p-2 md:max-w-4xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h1>This feature requires you to be logged in with Last.FM</h1>
          <LoginLinkButton redirectTo={redirectUrl} />
        </CardContent>
      </Card>
    </main>
  );
}
