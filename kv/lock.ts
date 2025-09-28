import { retry } from "@std/async/retry";
import { formatKey, kv } from "./kv.ts";

const DEFAULT_EXPIRES_IN_MS = 1e3 * 30;

export async function acquireLock(key: Deno.KvKey) {
  const lockKey = ["locks", ...key];

  const lock = await kv.get(lockKey);
  if (lock.value) {
    console.debug(`${formatKey(key)} lock occupied`);
    return false;
  }

  const acquired = await kv.atomic()
    .check(lock)
    .set(lockKey, "🔒", { expireIn: DEFAULT_EXPIRES_IN_MS })
    .commit();

  console.debug(`${formatKey(key)} lock acquired = ${acquired.ok}`);

  return acquired.ok;
}

export async function releaseLock(key: Deno.KvKey) {
  console.debug(`${formatKey(key)} lock released`);
  await kv.delete(["locks", ...key]);
}

export function backoff<T>(key: Deno.KvKey) {
  const start = new Date();
  console.debug(`${formatKey(key)} backing off ${start.toISOString()}`);

  return retry(async () => {
    const item = await kv.get<T>(key);
    if (item.value === null) {
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      console.debug(
        `${
          formatKey(key)
        } backoff retry, started at ${start.toISOString()}, now ${now.toISOString()} with total ${diffMs}ms passed`,
      );
      throw new Error(`${formatKey(key)} backoff retry failed`);
    }
    return item.value;
  }, {
    minTimeout: 100,
    maxTimeout: 375,
    maxAttempts: 10,
    jitter: 0.7,
    multiplier: 1.5,
  });
}
