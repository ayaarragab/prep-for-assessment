import { Request, Response, NextFunction } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export function createRateLimiter({
  windowMs,
  max,
  message,
}: RateLimitOptions) {
  const buckets = new Map<string, RateLimitBucket>();

  function cleanupExpiredBuckets(now: number) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const key = req.ip || req.socket.remoteAddress || "unknown";
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil((now + windowMs) / 1000)),
      );
      return next();
    }

    if (existing.count >= max) {
      res.setHeader(
        "Retry-After",
        String(Math.ceil((existing.resetAt - now) / 1000)),
      );
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil(existing.resetAt / 1000)),
      );
      return res.status(429).json({ message });
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(max - existing.count));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(existing.resetAt / 1000)),
    );
    return next();
  };
}
