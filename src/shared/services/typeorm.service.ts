import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeormService = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_DB'),
    entities: [
      process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test'
        ? __dirname + 'dist/entities/**/*.entity{.ts,.js}'
        : __dirname + 'src/entities/**/*.entity.ts',
    ],
    synchronize: false,
    autoLoadEntities: true,
    migrations: [__dirname + '/db/migrations/**/*.ts'],
    seeds: [__dirname + '/db/seeds/**/*.ts'],
    factories: [__dirname + '/db/factories/**/*.ts'],
    cli: {
      migrationsDir: __dirname + '/db/migrations/',
    },
  }),
  inject: [ConfigService],
});
