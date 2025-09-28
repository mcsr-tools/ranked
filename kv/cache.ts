import { acquireLock, backoff, releaseLock } from "./lock.ts";
import { formatKey, kv } from "./kv.ts";
import { addMeta, hasMeta, isExpired, WithMeta } from "./meta.ts";

export async function cached<T extends object>(opts: {
  key: Deno.KvKey;
  ttlMs: (data: T) => number;
  fn: () => Promise<T>;
}): Promise<WithMeta<T>> {
  const cache = await kv.get<T>(opts.key);

  if (cache.value && hasMeta(cache.value) && !isExpired(cache.value)) {
    console.debug(`${formatKey(opts.key)} cache hit`);
    return cache.value!;
  }
  console.debug(`${formatKey(opts.key)} cache expired`);

  if (!await acquireLock(opts.key)) {
    return backoff(opts.key);
  }

  try {
    const data = await opts.fn();
    const ttlMs = opts.ttlMs(data);
    const value = addMeta(data, ttlMs);
    await kv.set(opts.key, value, { expireIn: ttlMs });
    return value;
  } finally {
    await releaseLock(opts.key);
  }
}
