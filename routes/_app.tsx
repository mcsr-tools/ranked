import { FreshContext } from "$fresh/server.ts";
import { asset } from "$fresh/runtime.ts";
import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime";
import dayjsDuration from "dayjs/plugin/duration";
import { Footer, Header } from "#/components/mod.ts";
import { fetchUserData } from "#/mcsrranked/mod.ts";

dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsDuration);

export default async function App(_req: Request, ctx: FreshContext) {
  const basePath = ctx.basePath !== "/" ? ctx.basePath : "";
  const author = await fetchUserData("f98158a67b4c495bbfe0db9c2c9022dd");

  return (
    <html className="scroll-smooth" data-theme="dracula">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/favicon-16x16.png`}
        />
        <title>MCSR Ranked Watch</title>
        <link
          rel="stylesheet"
          href={`${basePath}/font?family=Ranked&name=Gamer&ext=ttf&adjust=150`}
        />
        <link
          rel="stylesheet"
          href={`${basePath}/font?family=Minecraft&name=MinecraftRegular&ext=otf`}
        />
        <link
          rel="stylesheet"
          href={asset(`${basePath}/styles.css`)}
        />
      </head>
      <body className="container mx-auto px-4 pt-4 mb-8">
        <Header />
        <main className="mt-10">
          <ctx.Component />
        </main>
        <Footer user={author} />
      </body>
    </html>
  );
}
