import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserProfile } from 'src/entities/user.entity';
import { UserStoreDTO, UserUpdateDTO } from '../dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';
import { Role } from 'src/entities/role.entity';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { Company } from 'src/entities/company.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @Inject()
    private hashHelper: HashHelpers,
  ) {}

  async store({ roles, ...payload }: UserStoreDTO): Promise<User> {
    try {
      let company: Company = undefined

      if (payload.profile !== UserProfile.ADMIN) {
        if (!payload.company_code) throw new BadRequestException('Company is required to create a user!')

          company = await this.companiesRepository.findOne({ where: { code: payload.company_code }})
      }

      const prepareUser = this.usersRepository.create(payload);

      if (roles) {
        let payloadRoles = {}

        for (const roleKey of roles) {
          payloadRoles[roleKey] = true
        }

        prepareUser.roles = await this.rolesRepository.save(payloadRoles)
      }

      const password = await this.hashHelper.generateHash(payload.password)

      const user = await this.usersRepository.save({
        ...prepareUser,
        password,
        is_temporary_password: true,
        company
      })

      return user;
    } catch (e) {
      throw e;
    }
  }
  async show(code: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { code },
        relations: {
          roles: true
        }
      });

      if (!user) throw new NotFoundException(ErrorsHelpers.USER_NOT_FOUND);

      return user;
    } catch (e) {
      throw e;
    }
  }
  async showByEmail(email: string): Promise<User> {
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
  async showByOTP(otp: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          otp_code: otp,
          otp_code_expires_at: MoreThanOrEqual(new Date()),
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
  async update(code: string, payload: UserUpdateDTO): Promise<User> {
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
