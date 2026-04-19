import { Redis } from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

class CacheService {
  private redis?: Redis;
  private readonly fallback = new Map<string, { value: string; expiresAt: number }>();
  private warned = false;

  private disableRedis(reason: unknown) {
    if (!this.warned) {
      logger.warn(`Redis unavailable, using in-memory fallback: ${String(reason)}`);
      this.warned = true;
    }

    if (this.redis) {
      this.redis.removeAllListeners();
      this.redis.disconnect();
      this.redis = undefined;
    }
  }

  constructor() {
    if (env.NODE_ENV === "test") return;

    this.redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.redis.on("error", (error: unknown) => {
      this.disableRedis(error);
    });

    this.redis.connect().catch((error: unknown) => {
      this.disableRedis(error);
    });
  }

  async get(key: string) {
    if (this.redis) {
      const value = await this.redis.get(key);
      if (value) return value;
    }

    const item = this.fallback.get(key);
    if (!item || item.expiresAt <= Date.now()) {
      this.fallback.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    if (this.redis) {
      await this.redis.set(key, value, "EX", ttlSeconds);
      return;
    }

    this.fallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(prefix: string) {
    if (this.redis) {
      const keys = await this.redis.keys(prefix);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    }

    for (const key of this.fallback.keys()) {
      if (key.startsWith(prefix.replace("*", ""))) {
        this.fallback.delete(key);
      }
    }
  }
}

export const cache = new CacheService();
