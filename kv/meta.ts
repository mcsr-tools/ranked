type UpdatedAt = {
  _updatedAt: number;
};

type ExpiresAt = {
  _expiresAt: number;
};

export type WithMeta<T> = T & UpdatedAt & ExpiresAt;

export function hasMeta<T extends object>(val: T): val is WithMeta<T> {
  return ("_updatedAt" satisfies keyof WithMeta<T>) in val &&
    ("_expiresAt" satisfies keyof WithMeta<T>) in val;
}

export function addMeta<T extends object>(
  obj: T,
  expiresIn: number,
): WithMeta<T> {
  const now = Date.now();
  return {
    ...obj,
    _updatedAt: now,
    _expiresAt: now + expiresIn,
  };
}

export function isExpired<T>(
  value: WithMeta<T>,
  now = Date.now(),
) {
  return now > value._expiresAt;
}
