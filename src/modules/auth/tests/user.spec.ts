import {
  TestingAuthModule,
  TestingDatabaseInitialize,
} from 'src/shared/test/utils/setup.util';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Users, UserType } from 'src/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';
import { UserStoreDTO } from '../dto/user.dto';
import { UserService } from '../services/user.service';

describe('UserService', () => {
  let userService: UserService;
  const database: DataSource = TestingDatabaseInitialize();

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({});
    userService = testingModule.get<UserService>(UserService);
  });

  it('should return created user on signUp', async () => {
    const inputedUser: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      type: UserType.DIVER,
    };

    const newUser = await userService.store(inputedUser);

    const createdUser = await database.manager.findOne(Users, {
      where: {
        code: newUser.code,
      },
    });

    expect(createdUser.email).toBe(inputedUser.email);
  });

  it('should return error when try create user with type admin', async () => {
    const dtoInstance = plainToInstance(UserStoreDTO, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      type: UserType.ADMIN,
    });
    const [validationError]: ValidationError[] = await validate(dtoInstance);

    expect(validationError).toBeInstanceOf(ValidationError);
    expect(validationError).toHaveProperty('property', 'type');
  });

  it('should return user with show', async () => {
    const inputedUser: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      type: UserType.DIVER,
    };

    const createdUser = await database.manager.save(Users, inputedUser);

    const userFound = await userService.show(createdUser.code);

    expect(userFound.email).toBe(inputedUser.email);
  });

  it('should return not found error when try find an user', async () => {
    const userFound = userService.show(faker.string.uuid());

    await expect(userFound).rejects.toThrow(NotFoundException);
    await expect(userFound).rejects.toThrow(ErrorsHelpers.USER_NOT_FOUND);
  });
});
