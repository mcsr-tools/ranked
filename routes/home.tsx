import { FreshContext, RouteConfig } from "$fresh/server.ts";
import { LiveMatches } from "#/components/mod.ts";
import { getLiveMatches } from "#/mcsrranked/mod.ts";

const BASE_PATH = Deno.env.get("FRESH_CONFIG_BASE_PATH");

export const handler = {
  GET(_req: Request, ctx: FreshContext) {
    if (
      BASE_PATH &&
      ctx.basePath === BASE_PATH &&
      ctx.url.pathname !== `${BASE_PATH}/watch`
    ) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/watch" },
      });
    }
    return ctx.render();
  },
};

export default async function HomePage(_req: Request, ctx: FreshContext) {
  const liveData = await getLiveMatches();

  return (
    <div>
      <LiveMatches
        data={liveData}
        basePath={ctx.basePath}
        searchParams={Object.fromEntries(ctx.url.searchParams)}
      />
    </div>
  );
}

export const config: RouteConfig = {
  routeOverride: `(${BASE_PATH || "/"}|${BASE_PATH || ""}/watch)`,
};
