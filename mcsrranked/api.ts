import { cached, kv } from "#/kv/mod.ts";
import { BUILD_ID } from "$fresh/src/runtime/build_id.ts";
import { DEBUG } from "$fresh/src/server/constants.ts";
import * as C from "./constants.ts";
import {
  DataLeaderboard,
  DataLive,
  DataUserData,
  isError,
  Result,
} from "./types.ts";

export function fetchLiveMatches() {
  return cached({
    key: C.KV_KEY_API_LIVE,
    ttlMs: () => C.API_CACHE_MS_LIVE_MATCHES,
    fn: () =>
      GET<DataLive>(C.API_URL_ENDPOINT_LIVE)
        .then((json) => json.data),
  });
}

export function fetchUserData(identifier: string) {
  return cached({
    key: [...C.KV_KEY_API_USER_DATA, identifier],
    ttlMs: () => C.API_CACHE_MS_USER_DATA,
    fn: () =>
      GET<DataUserData>(`${C.API_URL_ENDPOINT_USERS}/${identifier}`)
        .then((json) => json.data),
  });
}

export function fetchLeaderboard() {
  return cached({
    key: C.KV_KEY_API_LEADERBOARD,
    ttlMs: () => C.API_CACHE_MS_LEADERBOARD,
    fn: async () => {
      const json = await GET<DataLeaderboard>(C.API_URL_ENDPOINT_LEADERBOARD);
      // Leaderboard updates isn't atomic for some reason meaning array can be out
      // of order whilst rank is correct. Let's reorder by rank just in case.
      json.data.users.sort((a, b) => a.eloRank! - b.eloRank!);

      const current = await kv.get(C.KV_KEY_API_LEADERBOARD);
      if (current.value) {
        await kv.set(C.KV_KEY_API_LEADERBOARD_PREV, current.value);
      }

      return json.data;
    },
  });
}

async function GET<T extends object>(url: string) {
  const prefix = `GET ${url}`;

  log(`${prefix} fetching`);
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        "User-Agent": `RankedWatch/${BUILD_ID} (${DEBUG ? "dev" : "prod"})`,
      },
    },
  );

  const json = await response.json() as Result<T>;
  const rl = response.headers.get("ratelimit");
  log(`${prefix} status = ${json.status}, ratelimit = ${rl}`);

  if (isError(json)) {
    throw new Error(
      `Could not reach MCSR Ranked API ${url}, reason = ${json.data}`,
    );
  }

  return json;
}

function log(msg: string | null) {
  console.log(`[MCSR Ranked API]: ${msg}`);
}
