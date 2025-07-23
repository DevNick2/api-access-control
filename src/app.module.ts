import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './modules/auth/auth.module';

import { AuthController } from './modules/auth/controllers/auth.controller';

import { TypeormService } from './shared/services/typeorm.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './shared/guard/auth.guard';
import { CompanyController } from './modules/company/controllers/company.controller';
import { CompanyModule } from './modules/company/company.module';
import { KevyService } from './shared/services/kevy.service';

@Global()
@Module({
  imports: [
    AuthModule,
    CompanyModule,
    TypeormService,
    JwtModule.register({ global: true, signOptions: { expiresIn: '60s' } }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    KevyService,
  ],
  controllers: [AuthController, CompanyController],
  exports: [KevyService],
})
export class AppModule {}
