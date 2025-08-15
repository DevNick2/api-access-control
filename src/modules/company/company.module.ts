import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { CompanyController } from './controllers/company.controller';
import { CompanyService } from './services/company.service';
import { Device } from 'src/entities/device.entity';
import { UserService } from '../auth/services/user.service';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { DeviceService } from './services/device.service';
import { RedisService } from 'src/shared/services/redis.service';
import { EncrypterService } from 'src/shared/services/encrypter.service';
import { AxiosService } from 'src/shared/services/axios.service';
import { PersonService } from './services/person.service';
import { Person } from 'src/entities/person.entity';
import { AccessRule } from 'src/entities/access_rule.entity';
import { TimeZone } from 'src/entities/time_zone.entity';
import { TimeSpan } from 'src/entities/time_span.entity';
import { AccessRuleTimeZone } from 'src/entities/access_rule_time_zone.entity';
import { PersonAccessRule } from 'src/entities/person_access_rule.entity';
import { AccessOrchestratorService } from './services/access-orchestrator.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Company,
    Device,
    User,
    Role,
    Person,
    AccessRule,
    TimeZone,
    TimeSpan,
    AccessRuleTimeZone,
    PersonAccessRule
  ])],
  providers: [
    CompanyService,
    UserService,
    HashHelpers,
    DeviceService,
    RedisService,
    EncrypterService,
    AxiosService,
    PersonService,
    AccessOrchestratorService
  ],
  controllers: [CompanyController],
  exports: [CompanyService, DeviceService, PersonService, AccessOrchestratorService],
})
export class CompanyModule {}
