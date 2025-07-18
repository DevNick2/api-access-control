import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './modules/auth/auth.module';

import { AuthController } from './modules/auth/controllers/auth.controller';

import { TypeormService } from './shared/services/typeorm.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './shared/guard/auth.guard';

@Global()
@Module({
  imports: [
    AuthModule,
    TypeormService,
    JwtModule.register({ global: true, signOptions: { expiresIn: '60s' } }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [],
})
export class AppModule {}
