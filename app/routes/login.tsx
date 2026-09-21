import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import LoginLinkButton from "~/components/common/login-link-button";
import Alert from "~/components/common/alert";
import { safeRedirect } from "~/utils";

export const meta: MetaFunction = () => ({
  title: "Log in, Scrbbl",
});

export const loader = async ({ request }: LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  // Was interpolated straight into the URL, so a missing parameter produced
  // the literal string "redirectTo=null".
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  return json({ redirectTo, error: searchParams.get("error") });
};

export default function Login() {
  const { error, redirectTo } = useLoaderData<typeof loader>();

  return (
    <div className="ambient-wash">
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col justify-center gap-7 px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-2xl font-extrabold tracking-[-0.06em] text-primary-foreground">
            S
          </span>
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Connect your Last.FM account
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            Scrbbl writes scrobbles to your profile, so Last.FM has to grant
            permission first. You will be sent to Last.FM and straight back
            here.
          </p>
        </div>

        {error ? (
          <Alert variant="error" title="That sign in did not complete">
            {error === "missing-token"
              ? "Last.FM sent you back without a token. Start again."
              : "Last.FM could not confirm the handshake. Start again."}
          </Alert>
        ) : null}

        <LoginLinkButton
          size="lg"
          redirectTo={redirectTo}
          className="w-full sm:w-fit"
        />

        <p className="text-sm leading-relaxed text-muted-foreground">
          Scrbbl only ever writes scrobbles and reads your profile counts. It
          cannot post, follow or change anything else on your account.
        </p>
      </div>
    </div>
  );
}
