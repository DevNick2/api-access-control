import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import { JwtProviderService } from 'src/shared/services/jwt-provider.service';
import { UserService } from './user.service';
import {
  LoginDTO,
  PasswordOtpDTO,
  PasswordResetDTO,
  VerifyOtpDTO,
} from '../dto/user.dto';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private usersService: UserService,
    @Inject()
    private hashHelper: HashHelpers,
    // @Inject()
    // private credentialsService: CredentialsService,
  ) {}

  async authenticate({ email, password }: LoginDTO): Promise<User> {
    try {
      const user = await this.usersService.showByEmail(email);

      if (!(await this.hashHelper.compareHash(password, user.password))) {
        throw new BadRequestException(ErrorsHelpers.PASSWORD_INCORRECT);
      }

      return user;
    } catch (e) {
      throw e;
    }
  }

  async otp({ email }: PasswordOtpDTO) {
    try {
      const user = await this.usersService.showByEmail(email);

      const { otp, otpExpire } = this.generateOtp();

      await this.usersService.update(user.code, {
        otp,
        otp_expires: otpExpire,
      });

      return otp;
    } catch (e) {
      throw e;
    }
  }

  generateOtp(): { otp: number; otpExpire: Date } {
    const otp = Math.floor(100000 + Math.random() * 9000);

    const otpExpire = new Date();

    otpExpire.setMinutes(otpExpire.getMinutes() + 1);

    return {
      otp,
      otpExpire,
    };
  }

  async checkOtpToResetPassword({ otp }: VerifyOtpDTO): Promise<boolean> {
    await this.usersService.showByOTP(otp);

    return true;
  }

  async validateOtpToNewUser({ otp }: VerifyOtpDTO): Promise<boolean> {
    const user = await this.usersService.showByOTP(otp);

    await this.usersService.update(user.code, { verified: true });

    return true;
  }

  async resetPassword({
    new_password,
    confirm_password,
    otp,
  }: PasswordResetDTO) {
    try {
      const user = await this.usersService.showByOTP(otp);

      if (new_password !== confirm_password)
        throw new BadRequestException(ErrorsHelpers.PASSWORD_NOT_EQUAL);

      const password = await this.hashHelper.generateHash(new_password);

      await this.usersService.update(user.code, {
        password,
        otp: null,
        otp_expires: null,
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
