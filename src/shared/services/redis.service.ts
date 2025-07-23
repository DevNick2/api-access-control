import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_INSTANCE')
    private readonly store: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any, ttl?: number) => Promise<boolean>;
      del: (key: string) => Promise<boolean>;
      reset: () => Promise<void>;
    }
  ) {}

  async get<T = any>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.store.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.store.del(key);
  }

  async clear(): Promise<void> {
    await this.store.reset();
  }
}
