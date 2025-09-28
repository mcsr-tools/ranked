export const kv = await Deno.openKv(
  // Deno Deploy handles this for us on in production.
  Deno.env.get("DENO_DEPLOYMENT_ID") || Deno.env.get("GITHUB_ACTIONS")
    ? undefined
    // https://github.com/denoland/deno/issues/21382#issuecomment-1832605542
    // https://github.com/denoland/deno/blob/328d5ef2a0febd3c46916c9d7cc74f8a578791af/ext/kv/sqlite.rs#L112
    : ":memory:",
);

export function formatKey(key: Deno.KvKey) {
  return `KvKey(${key.join(".")})`;
}
