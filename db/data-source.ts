import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: '.env.' + (process.env.NODE_ENV || 'development') });

import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DB,
  synchronize: false,
  dropSchema: false,
  logging: process.env.NODE_ENV !== 'production',
  logger: 'file',
  entities: [
    resolve(__dirname, process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test' 
      ? '../dist/**/*.entity{.ts,.js}'
      : '../src/entities/*.entity.ts')
  ],
  migrations: ['db/migrations/*.ts'],
});
