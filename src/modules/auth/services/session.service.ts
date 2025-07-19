import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtProviderService } from 'src/shared/services/jwt-provider.service';
import { UserService } from './user.service';
import { AuthDTO } from '../dto/auth.dto';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';

@Injectable()
export class SessionService {
  constructor(
    @Inject()
    private readonly jwtProviderService: JwtProviderService,

    @Inject()
    private userService: UserService,
  ) {}

  async openSession(user: { code: string; email: string }): Promise<AuthDTO> {
    try {
      const token = await this.jwtProviderService.generateAccessToken({
        sub: user.code,
        email: user.email,
        expiresIn: '60m',
      });

      const refreshToken = await this.jwtProviderService.generateRefreshToken({
        sub: user.code,
        expiresIn: '7d',
      });

      await this.userService.update(user.code, {
        refresh_token: refreshToken,
      });

      return { access_token: token, refresh_token: refreshToken };
    } catch (e) {
      throw e;
    }
  }
  closeSession() {}
  getUserSession() {}

  async refreshToken(refresh_token: string) {
    try {
      const { sub } = await this.jwtProviderService.verify(refresh_token);

      const user = await this.userService.show(sub);

      if (!user) throw new RpcException({ code: ErrorsHelpers.USER_NOT_FOUND });

      const token = await this.jwtProviderService.generateAccessToken({
        sub: user.code,
        email: user.email,
        expiresIn: '60m',
      });

      return { token };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
