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
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
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
import { PersonService } from 'src/modules/company/services/person.service';
import { AccessRule } from 'src/entities/access_rule.entity';
import { AccessRuleTimeZone } from 'src/entities/access_rule_time_zone.entity';
import { Company } from 'src/entities/company.entity';
import { Device } from 'src/entities/device.entity';
import { Person } from 'src/entities/person.entity';
import { Role } from 'src/entities/role.entity';
import { TimeSpan } from 'src/entities/time_span.entity';
import { TimeZone } from 'src/entities/time_zone.entity';
import { User } from 'src/entities/user.entity';
import { PersonAccessRule } from 'src/entities/person_access_rule.entity';
import { AccessOrchestratorService } from 'src/modules/company/services/access-orchestrator.service';

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
  withMockedData
}: {
  withMockedData: boolean
}): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      TypeormService,
      ...(!withMockedData ? [TypeOrmModule.forFeature([
        Company,
        User,
        Role,
        Device,
        Person,
        AccessRule,
        AccessRuleTimeZone,
        TimeZone,
        TimeSpan,
        PersonAccessRule,
      ])] : []),
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
      PersonService,
      EncrypterService,
      AccessOrchestratorService,
      KevyService,
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      ...(withMockedData ? [
        {
          provide: getRepositoryToken(User),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(Company),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(Device),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(Person),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(PersonAccessRule),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(AccessRule),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(AccessRuleTimeZone),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(TimeZone),
          useFactory: repository,
        },
        {
          provide: getRepositoryToken(TimeSpan),
          useFactory: repository,
        },
      ] : [])
    ],
    controllers: [AuthController, CompanyController],
  }).compile();
}

export async function TestingDatabaseInitialize(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize()

      console.log('Database testing connection opened!');

      // dataSource.query(
      //   'TRUNCATE TABLE "device", "role", "company", "access_rule", "person", "time_span", "time_zone", "access_rule_time_zone", "person_access_rule" RESTART IDENTITY CASCADE',
      // );

      return dataSource
    } catch (e) {
      console.log('Database testing can´t be initialized!', e);
    }
  }

  return dataSource;
}
