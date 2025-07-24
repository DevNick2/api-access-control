import { TestingDatabaseInitialize, TestingAuthModule, repository } from "src/shared/test/utils/setup.util";
import { DataSource, Repository } from "typeorm";
import { CompanyService } from "../services/company.service";
import { generateRandomUser } from "src/shared/test/utils/__mocks";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User, UserProfile } from "src/entities/user.entity";
import { MockType } from "src/shared/test/utils/__util";
import { HashHelpers } from "src/shared/helpers/hash.helper";
import { Company } from "src/entities/company.entity";
import { Role } from "src/entities/role.entity";
import { faker } from "@faker-js/faker/.";
import { UserStoreDTO } from "src/modules/auth/dto/user.dto";
import { CompanyStoreDTO } from "../dto/company.dto";
import { Reflector } from "@nestjs/core";
import { JwtService, TokenExpiredError, JsonWebTokenError } from "@nestjs/jwt";
import * as request from 'supertest';
import { CompanyResources } from "../resources/company.resource";
import { Device } from "src/entities/device.entity";
import { Person } from "src/entities/person.entity";

describe('Companies management', () => {
  let app
  let jwtService: JwtService
  let reflector: Reflector
  let companyService: CompanyService
  let userRepository: MockType<Repository<User>>;
  let database: DataSource
  let hashHelpers: HashHelpers

  beforeAll(async () => {
    database = await TestingDatabaseInitialize()
  })

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({
      realDatabase: [Company, User, Role, Device, Person],
    });

    userRepository = testingModule.get<MockType<Repository<User>>>(
      getRepositoryToken(User),
    );

    companyService = testingModule.get<CompanyService>(CompanyService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers)
    jwtService = testingModule.get<JwtService>(JwtService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers);
    reflector = testingModule.get<Reflector>(Reflector);

    app = testingModule.createNestApplication();

    await app.init();
  });

  // E2E
  it('should allow an admin to create a new company with valid data', async () => {
    // given: an authenticated user with profile "admin"
    const user: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.ADMIN,
    };

    const newUser = await database.manager.save(User, {
      ...user,
      is_temporary_password: false,
      roles: undefined
    })

    // and: a valid payload with name, cnpj and domain
    const company: CompanyStoreDTO = {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
    }

    const jwt = faker.internet.jwt({
      payload: { exp: faker.date.soon() },
    });

    // Mock ReflectorClass to check Decorator IS_PUBLIC
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    // Mock jwt verify to force JWT Token valid
    jwtService.verifyAsync = jest.fn().mockResolvedValue({
      sub: newUser.code
    });

    // then: return 201 Created with the company resource
    const response = await request(app.getHttpServer())
      .post('/companies')
      .send(company)
      .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(new CompanyResources(response.body))
  });
  

  // it('should reject creation attempt by user with profile manager or user', async () => {
  //   // given: an authenticated user with profile "manager" or "user"
  //   // and: a valid payload
  //   // when: POST /companies is called
  //   // then: return 403 Forbidden
  //   // and: the company is not persisted in the database
  // });

  // it('should reject creation if a company with the same CNPJ already exists', async () => {
  //   // given: a company already exists with a specific CNPJ
  //   // and: an authenticated admin tries to create another with same CNPJ
  //   // when: POST /companies is called
  //   // then: return 400 Bad Request with duplication error
  // });

  // it('should reject creation if a company with the same domain already exists', async () => {
  //   // given: a company already exists with a specific domain
  //   // when: a new company is created with the same domain
  //   // then: return 400 Bad Request with duplication error
  // });

  // it('should return a list of companies for an admin user', async () => {
  //   // given: an authenticated admin
  //   // and: multiple companies exist in the database
  //   // when: GET /companies is called
  //   // then: return 200 with a paginated list of companies
  // });

  // it('should reject listing attempt for non-admin users', async () => {
  //   // given: an authenticated user with profile "manager" or "user"
  //   // when: GET /companies is called
  //   // then: return 403 Forbidden
  // });

  afterAll(async () => {
    await app.close();
  });
});
