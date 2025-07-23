import KeyvRedis, { Keyv } from "@keyv/redis";
import { ConfigService } from "@nestjs/config";

export const KevyService = {
  provide: 'REDIS_INSTANCE',
  useFactory: async (configService: ConfigService) => {
    const redisHost = configService.get<string>('REDIS_HOST');
    const redisPort = configService.get<string>('REDIS_PORT');

    const store = new KeyvRedis(`redis://${redisHost}:${redisPort}`);
    const keyv = new Keyv({ store });

    // Adaptar o store para compatibilidade com NestJS Cache
    return {
      get: (key: string) => keyv.get(key),
      set: (key: string, value: any, ttl?: number) => keyv.set(key, value, ttl),
      del: (key: string) => keyv.delete(key),
      reset: () => keyv.clear(),
    };
  },
  inject: [ConfigService],
}