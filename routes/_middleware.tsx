import { FreshContext } from "$fresh/server.ts";

export async function handler(_req: Request, ctx: FreshContext) {
  const resp = await ctx.next();
  const headers = resp.headers;
  headers.set("Access-Control-Allow-Origin", "https://mcsr.tools");
  headers.set("Access-Control-Allow-Methods", "GET");
  headers.set("Access-Control-Max-Age", "3600");
  return resp;
}
