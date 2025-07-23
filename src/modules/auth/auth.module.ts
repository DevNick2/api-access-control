import { Module } from '@nestjs/common';

import { AuthController } from './controllers/auth.controller';

import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { SessionService } from './services/session.service';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtProviderService } from 'src/shared/services/jwt-provider.service';
import { Role } from 'src/entities/role.entity';
import { Company } from 'src/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Company])],
  providers: [
    AuthService,
    SessionService,
    UserService,
    HashHelpers,
    JwtProviderService,
  ],
  controllers: [AuthController],
  exports: [AuthService, SessionService, UserService],
})
export class AuthModule {}
