const bucket = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const current = bucket.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    bucket.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  current.count += 1;
  bucket.set(key, current);
  return { ok: true, remaining: limit - current.count };
}
