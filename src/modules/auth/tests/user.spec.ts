import {
  repository,
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
import { Company } from 'src/entities/company.entity';
import { CompanyStoreDTO } from 'src/modules/company/dto/company.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Device } from 'src/entities/device.entity';

describe('User Management', () => {
  let userService: UserService;
  let database: DataSource

  beforeAll(async () => {
    database = await TestingDatabaseInitialize()
  })

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({
      realDatabase: [User, Role, Company, Device]
    });

    userService = testingModule.get<UserService>(UserService);
  });

  it('should create a MANAGER with temporary password', async () => {
    const newCompany = await database.manager.save(Company, {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
    })

    // given: a request to create a manager
    const user: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.MANAGER,
      company_code: newCompany.code
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

  // it('should allow a manager to create a user with restricted role within their company', async () => {
  //   // given: an authenticated user with profile "manager"
  //   // and: a valid payload with role "USER" (not manager/admin)
  //   // and: a valid company_code in the URL
  //   // when: POST /companies/:code is called
  //   // then: return 201 Created with the new user's data
  //   // and: the user is stored with the company_code from the URL
  // });

  // it('should allow a manager to create a user with restricted role within their company', async () => {
  //   // given: an authenticated user with profile "manager"
  //   // and: a valid payload with role "USER" (not manager/admin)
  //   // and: a valid company_code in the URL
  //   // when: POST /companies/:code is called
  //   // then: return 201 Created with the new user's data
  //   // and: the user is stored with the company_code from the URL
  // });
});
