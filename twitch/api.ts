import { cached } from "#/kv/mod.ts";
import { AppToken, Result, Stream } from "./types.ts";

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID");
if (!TWITCH_CLIENT_ID) throw new Error("No Twitch client ID provided");
const TWITCH_CLIENT_SECRET = Deno.env.get("TWITCH_CLIENT_SECRET");
if (!TWITCH_CLIENT_SECRET) throw new Error("No Twitch client secret provided");

/** https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow */
export function fetchToken() {
  return cached({
    key: ["twitch", "api", "auth"],
    ttlMs: (data) => {
      const buffer = 600;
      return (data.expires_in - buffer) * 1000;
    },
    fn: async () => {
      const url = new URL("https://id.twitch.tv/oauth2/token");

      const body = new URLSearchParams();
      body.set("client_id", TWITCH_CLIENT_ID!);
      body.set("client_secret", TWITCH_CLIENT_SECRET!);
      body.set("grant_type", "client_credentials");

      log(`${url.toString()} fetching`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (response.status !== 200) {
        const reason = await response.text();
        throw new Error(
          `Could not get Twitch credentials, status = ${response.status}, reason = ${reason}`,
        );
      }

      return await response.json() as AppToken;
    },
  });
}

/** https://dev.twitch.tv/docs/api/reference/#get-streams */
export async function fetchStreams(
  token: string,
  params: {
    userLogins: string[];
  },
) {
  const url = new URL("https://api.twitch.tv/helix/streams");

  url.searchParams.set("first", "100");
  params.userLogins?.slice(0, 100).forEach((it) => {
    url.searchParams.append("user_login", it);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Client-Id", TWITCH_CLIENT_ID!);

  log(`${url.toString()} fetching`);
  const response = await fetch(url, { headers });

  const rl = response.headers.get("ratelimit-remaining");
  log(`${url.toString()} status = ${response.status}, ratelimit = ${rl}`);

  if (response.status !== 200) {
    throw new Error(
      `Could not fetch Twitch streams, status = ${response.status}`,
    );
  }

  const json = await response.json() as Result<Stream[]>;
  return json.data;
}

function log(msg: string | null) {
  console.log(`[Twitch API]: ${msg}`);
}
