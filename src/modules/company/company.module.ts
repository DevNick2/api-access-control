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

@Module({
  imports: [TypeOrmModule.forFeature([Company, Device, User, Role])],
  providers: [CompanyService, UserService, HashHelpers, DeviceService, RedisService, EncrypterService, AxiosService],
  controllers: [CompanyController],
  exports: [CompanyService, DeviceService],
})
export class CompanyModule {}
