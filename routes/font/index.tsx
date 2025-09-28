import { FreshContext } from "$fresh/server.ts";

export const handler = {
  GET(req: Request, ctx: FreshContext) {
    const url = new URL(req.url);
    const family = url.searchParams.get("family")?.trim()?.slice(0, 100);
    const name = url.searchParams.get("name")?.trim()?.slice(0, 100);
    const ext = url.searchParams.get("ext")?.trim()?.slice(0, 3);

    const safeChars = /^[a-zA-Z0-9\s-]+$/;
    if (
      (!family || !safeChars.test(family)) ||
      (!name || !safeChars.test(name)) ||
      (!ext || !["ttf", "otf"].includes(ext))
    ) {
      return ctx.renderNotFound();
    }

    let body = `@font-face {
  font-family: "${family}";
  font-display: swap;
  src: url("${ctx.basePath}/fonts/${name}.${ext}");`;

    const adjust = url.searchParams.get("adjust");
    if (adjust) {
      const num = Number.parseInt(adjust);
      if (Number.isInteger(num) && num > 0 && num <= 200) {
        body += `\n  size-adjust: ${num}%;`;
      }
    }

    body += "\n}";

    const headers = new Headers();
    headers.set("Content-Type", "text/css; charset=utf-8");

    return new Response(body, { headers });
  },
};
