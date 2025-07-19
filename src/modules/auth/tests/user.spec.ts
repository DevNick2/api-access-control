import {
  TestingAuthModule,
  TestingDatabaseInitialize,
} from 'src/shared/test/utils/setup.util';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User, UserProfile } from 'src/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';
import { UserStoreDTO } from '../dto/user.dto';
import { UserService } from '../services/user.service';

describe('User Management', () => {
  let userService: UserService;

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({});

    userService = testingModule.get<UserService>(UserService);
  });

  it('should create a MANAGER with temporary password', async () => {
    // given: a request to create a manager
    const user: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.MANAGER,
    };

    // when: manager is created with temporary password
    const createdUser = await userService.store(user)

    // then: property is_temporary_password is true
    expect(createdUser.is_temporary_password).toBe(true)
  });
  
  it('should create a USER with temporary password', async () => {
    // given: a request to create a user
    const user: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.USER,
    };

    // when: manager is created with temporary password
    const createdUser = await userService.store(user)

    // then: property is_temporary_password is true
    expect(createdUser.is_temporary_password).toBe(true)
  });

  // it('should send an email with the login link and password', async () => {
  //   // given: manager creation is successful
  //   // when: the process completes
  //   // then: an email is sent to the manager with access instructions
  // });

  // it('should reject creation if authenticated user is not ADMIN', async () => {
  //   // given: an authenticated user with role MANAGER
  //   // when: tries to create a user with role MANAGER
  //   // then: return 403 Forbidden
  // });

  // it('should reject creation if email already exists', async () => {
  //   // given: a user already exists with the provided email
  //   // when: a new user is created using the same email
  //   // then: return 400 Bad Request with duplication error
  // });
});
