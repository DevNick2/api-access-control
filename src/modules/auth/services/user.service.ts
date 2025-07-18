import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from 'src/entities/user.entity';
import { UserStoreDTO, UserUpdateDTO } from '../dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async store(payload: UserStoreDTO): Promise<Users> {
    try {
      const user = await this.usersRepository.save(payload);

      return user;
    } catch (e) {
      throw e;
    }
  }
  async show(code: string): Promise<Users> {
    try {
      const user = await this.usersRepository.findOne({
        where: { code },
      });

      if (!user) throw new NotFoundException(ErrorsHelpers.USER_NOT_FOUND);

      return user;
    } catch (e) {
      throw e;
    }
  }
  async showByEmail(email: string): Promise<Users> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email,
        },
      });

      if (!user)
        throw new BadRequestException(ErrorsHelpers.CREDENTIALS_INVALID);

      return user;
    } catch (e) {
      throw e;
    }
  }
  async showByOTP(otp: number): Promise<Users> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          otp,
          otp_expires: MoreThanOrEqual(new Date()),
        },
      });

      if (!user)
        throw new BadRequestException(ErrorsHelpers.OTP_INVALID_OR_EXPIRED);

      return user;
    } catch (e) {
      throw e;
    }
  }
  list() {}
  delete() {}
  async update(code: string, payload: UserUpdateDTO): Promise<Users> {
    try {
      const prepare = this.usersRepository
        .createQueryBuilder()
        .where('code = :code', { code });

      const user = await prepare.getOne();

      if (!user) throw new NotFoundException(ErrorsHelpers.USER_NOT_FOUND);

      for (const key in payload) {
        user[key] = payload[key];
      }

      await user.save();

      return user;
    } catch (e) {
      throw e;
    }
  }
}
