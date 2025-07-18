import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/controllers/auth.controller';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { DataSource, Repository } from 'typeorm';
import { MockType } from './__util';

import * as dataSource from '../../../../db/data-source';
import { UserService } from 'src/modules/auth/services/user.service';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/user.entity';
import { TypeormService } from 'src/shared/services/typeorm.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { JwtProviderService } from 'src/shared/services/jwt-provider.service';
import { AuthGuard } from 'src/shared/guard/auth.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';

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

export async function TestingCustomerModule({
  withMockedDatabase,
}: {
  withMockedDatabase?: boolean;
}): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      TypeormService,
      ...(!withMockedDatabase
        ? [
            TypeOrmModule.forFeature([
              Users,
            ]),
          ]
        : []),
      ConfigModule.forRoot({
        envFilePath: `.env.test`,
      }),
    ],
    providers: [...(withMockedDatabase ? [] : [])],
  }).compile();
}

export async function TestingAuthModule({
  withMockedDatabase,
}: {
  withMockedDatabase?: boolean;
}): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      TypeormService,
      ...(!withMockedDatabase ? [TypeOrmModule.forFeature([Users])] : []),
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
      JwtProviderService,
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      ...(withMockedDatabase
        ? [
            {
              provide: getRepositoryToken(Users),
              useFactory: repository,
            },
          ]
        : []),
    ],
    controllers: [AuthController],
  }).compile();
}

export function TestingDatabaseInitialize(): DataSource {
  if (!dataSource.default.isInitialized) {
    dataSource.default
      .initialize()
      .then(() => {
        console.log('Database testing connection opened!');
      })
      .catch((e) => {
        console.log('Database testing can´t be initialized!', e);
      });
  }

  return dataSource.default;
}
