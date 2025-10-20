import { FreshContext, RouteConfig } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
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
    <>
      <Head>
        <link
          rel="canonical"
          href="https://mcsr.tools/ranked/watch"
        />
      </Head>
      <div>
        <LiveMatches
          data={liveData}
          basePath={ctx.basePath}
          searchParams={fromSearchParams(ctx.url.searchParams)}
        />
      </div>
    </>
  );
}

export const config: RouteConfig = {
  routeOverride: `(${BASE_PATH || "/"}|${BASE_PATH || ""}/watch)`,
};

export function fromSearchParams(
  params: URLSearchParams,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of params) {
    if (key in result) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}
