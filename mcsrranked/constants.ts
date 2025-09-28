// deno-fmt-ignore-file
export const LEADERBOARD_SIZE = 20;

export const API_URL = "https://api.mcsrranked.com"
export const API_URL_ENDPOINT_LIVE        = `${API_URL}/live`
export const API_URL_ENDPOINT_USERS       = `${API_URL}/users`
export const API_URL_ENDPOINT_LEADERBOARD = `${API_URL}/leaderboard`

export const API_CACHE_MS_LIVE_MATCHES = 1e3 * 30;
export const API_CACHE_MS_USER_DATA    = 1e3 * 60 * 10;
export const API_CACHE_MS_LEADERBOARD  = 1e3 * 60 * 30;

export const KV_PATH                     = "mcsrranked";
export const KV_KEY_API_PREFIX           = [KV_PATH, "api"]                        as const satisfies Deno.KvKey;
export const KV_KEY_API_LIVE             = [...KV_KEY_API_PREFIX, "live"]          as const satisfies Deno.KvKey;
export const KV_KEY_API_USER_DATA        = [...KV_KEY_API_PREFIX, "users"]         as const satisfies Deno.KvKey;
export const KV_KEY_API_LEADERBOARD      = [...KV_KEY_API_PREFIX, "leaderboard"]   as const satisfies Deno.KvKey;
export const KV_KEY_API_LEADERBOARD_PREV = [...KV_KEY_API_LEADERBOARD, "previous"] as const satisfies Deno.KvKey;
