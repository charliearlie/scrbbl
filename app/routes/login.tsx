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
        <CardContent className="p-8">
          <h2 className="text-center text-2xl font-semibold text-card-foreground">
            This feature requires you to be logged in with Last.FM
          </h2>
          <div className="mt-8 flex w-full items-center justify-center">
            <LoginLinkButton redirectTo={redirectUrl} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
