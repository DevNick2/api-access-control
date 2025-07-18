import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorsHelpers } from '../helpers/errors.helper';

interface JwtPayload {
  expiresIn?: string;
  sub: string;
  email?: string;
}

@Injectable()
export class JwtProviderService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async sign(payload: JwtPayload, secret, expiresIn: string = '14m') {
    return await this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  async generateAccessToken({ expiresIn, ...payload }: JwtPayload) {
    return await this.sign(
      payload,
      await this.configService.get('TOKEN_SECRET'),
      expiresIn,
    );
  }

  async generateRefreshToken({ expiresIn, ...payload }: JwtPayload) {
    return await this.sign(
      payload,
      await this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn,
    );
  }

  async verify(token) {
    return await this.jwtService
      .verifyAsync(token, {
        secret: await this.configService.get('REFRESH_TOKEN_SECRET'),
      })
      .catch((e) => {
        if (e.name === 'TokenExpiredError')
          throw new BadRequestException(ErrorsHelpers.TOKEN_EXPIRED);

        throw Error(e);
      });
  }
}
