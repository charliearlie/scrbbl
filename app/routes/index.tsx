import type { LoaderArgs } from "@remix-run/node";
import { getUserInfo } from "~/services/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import HeroBanner from "~/components/hero-banner";

export const loader = async ({ request }: LoaderArgs) => {
  const userInfo = await getUserInfo(request);
  return typedjson({ userInfo });
};

export default function Index() {
  const { userInfo } = useTypedLoaderData<typeof loader>();
  return (
    <main>
      <HeroBanner user={userInfo} />
    </main>
  );
}
