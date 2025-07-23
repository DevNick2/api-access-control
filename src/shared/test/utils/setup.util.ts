import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/controllers/auth.controller';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { DataSource, Repository } from 'typeorm';
import { MockType } from './__util';

import dataSource from '../../../../db/data-source';
import { UserService } from 'src/modules/auth/services/user.service';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormService } from 'src/shared/services/typeorm.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { JwtProviderService } from 'src/shared/services/jwt-provider.service';
import { AuthGuard } from 'src/shared/guard/auth.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CompanyService } from 'src/modules/company/services/company.service';
import { CompanyController } from 'src/modules/company/controllers/company.controller';
import { DeviceService } from 'src/modules/company/services/device.service';
import { RedisService } from 'src/shared/services/redis.service';
import { KevyService } from 'src/shared/services/kevy.service';
import { AxiosService } from 'src/shared/services/axios.service';
import { EncrypterService } from 'src/shared/services/encrypter.service';

export const repository: () => MockType<Repository<any>> = jest.fn(() => ({
  save: jest.fn(),
  insert: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  getMany: jest.fn(),
  createQueryBuilder: jest.fn(),
  transaction: jest.fn(),
  getOne: jest.fn(),
  orderBy: jest.fn(),
  getAllAndOverride: jest.fn(),
}));

export async function TestingAuthModule({
  mockDatabase = [],
  realDatabase = []
}: {
  mockDatabase?
  realDatabase?
}): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      TypeormService,
      ...(realDatabase.length ? [TypeOrmModule.forFeature(realDatabase)] : []),
      ConfigModule.forRoot({
        envFilePath: `.env.test`,
      }),
    ],
    providers: [
      ConfigService,
      AuthGuard,
      Reflector,
      JwtService,
      AuthService,
      UserService,
      HashHelpers,
      SessionService,
      CompanyService,
      DeviceService,
      JwtProviderService,
      RedisService,
      AxiosService,
      EncrypterService,
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      KevyService,
      ...mockDatabase
    ],
    controllers: [AuthController, CompanyController],
  }).compile();
}

export async function TestingDatabaseInitialize(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize()

      console.log('Database testing connection opened!');

      return dataSource
    } catch (e) {
      console.log('Database testing can´t be initialized!', e);
    }
  }

  return dataSource;
}
