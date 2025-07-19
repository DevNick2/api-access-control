import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from 'src/shared/decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import {
  LoginDTO,
  UserStoreDTO,
  VerifyOtpDTO,
} from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { AuthResources } from '../resources/auth.resource';
import { UserResources } from '../resources/user.resource';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private authService: AuthService,
    @Inject() private sessionService: SessionService,
    @Inject() private userService: UserService,
  ) {}

  @Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() payload: LoginDTO): Promise<AuthResources> {
    const authenticated = await this.authService.authenticate(payload);

    const login = await this.sessionService.openSession({
      code: authenticated.code,
      email: authenticated.email,
    });

    return new AuthResources(login);
  }

  @Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('singup')
  async signUp(@Body() payload: UserStoreDTO): Promise<UserResources> {
    const user = await this.userService.store(payload);

    return new UserResources(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('validate-otp')
  async validateOtp(@Body() payload: VerifyOtpDTO) {
    return await this.authService.validateOtpToNewUser(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Request() req): Promise<UserResources> {
    return new UserResources(req.user);
  }
}
