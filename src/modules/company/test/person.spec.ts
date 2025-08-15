import { TestingDatabaseInitialize, TestingAuthModule, repository } from "src/shared/test/utils/setup.util";
import { DataSource, Repository } from "typeorm";
import { CompanyService } from "../services/company.service";
import { generateRandomUser } from "src/shared/test/utils/__mocks";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User, UserProfile } from "src/entities/user.entity";
import { MockType } from "src/shared/test/utils/__util";
import { HashHelpers } from "src/shared/helpers/hash.helper";
import { Company } from "src/entities/company.entity";
import { Role, RolesList } from "src/entities/role.entity";
import { faker } from "@faker-js/faker/.";
import { UserStoreDTO } from "src/modules/auth/dto/user.dto";
import { CompanyStoreDTO } from "../dto/company.dto";
import { HttpService } from '@nestjs/axios';
import { Reflector } from "@nestjs/core";
import { JwtService, TokenExpiredError, JsonWebTokenError } from "@nestjs/jwt";
import * as request from 'supertest';
import { CompanyResources } from "../resources/company.resource";
import { Device } from "src/entities/device.entity";
import { AxiosService } from "src/shared/services/axios.service";
import { EncrypterService } from "src/shared/services/encrypter.service";
import { DeviceStoreDTO } from "../dto/device.dto";
import { DeviceResources } from "../resources/device.resource";
import { AxiosInstance, AxiosResponse } from "axios";
import { RedisService } from "src/shared/services/redis.service";
import { DeviceService } from "../services/device.service";
import { Person, PersonType } from "src/entities/person.entity";
import { PersonService } from "../services/person.service";
import { PersonStoreDTO } from "../dto/person.dto";
import { PersonResources } from "../resources/person.resources";

describe('People management', () => {
  let app
  let jwtService: JwtService
  let reflector: Reflector
  let companyService: CompanyService
  let database: DataSource
  let hashHelpers: HashHelpers
  let axiosService: AxiosService
  let deviceService: DeviceService
  let personService: PersonService

  beforeAll(async () => {
    database = await TestingDatabaseInitialize()
  })

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({ withMockedData: false });

    companyService = testingModule.get<CompanyService>(CompanyService);
    jwtService = testingModule.get<JwtService>(JwtService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers);
    personService = testingModule.get<PersonService>(PersonService)
    reflector = testingModule.get<Reflector>(Reflector);
    axiosService = testingModule.get<AxiosService>(AxiosService);
    deviceService = testingModule.get<DeviceService>(DeviceService);

    app = testingModule.createNestApplication();

    await app.init();
  });

  it('should allow user with can_write_people role to create a person successfully', async () => {
    // given
    // - Usuário com perfil manager e role can_write_people
    // - Payload válido de criação de pessoa
    const person: PersonStoreDTO = {
      name: faker.person.fullName(),
      person_type: PersonType.EMPLOYEE,
      photo_url: faker.internet.url(),
      registration: faker.string.numeric(10)
    }
    const user: UserStoreDTO = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.USER,
      roles: [RolesList.CAN_WRITE_PEOPLE]
    };
    const company: CompanyStoreDTO = {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
    }
    const role = {}

    for (const key of user.roles) {
      role[key] = true
    }

    const newRoles = await database.manager.save(Role, role)
    const newCompany = await database.manager.save(Company, company)
    const newUser = await database.manager.save(User, {
      ...user,
      is_temporary_password: false,
      roles: newRoles,
      company: newCompany
    })

    const jwt = faker.internet.jwt({
      payload: { exp: faker.date.soon() },
    });

    // Mock ReflectorClass to check Decorator IS_PUBLIC
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    // Mock jwt verify to force JWT Token valid
    jwtService.verifyAsync = jest.fn().mockResolvedValue({
      sub: newUser.code
    });

    deviceService.dispatchToDevices = jest.fn().mockResolvedValue([{ response: { status: 200} }])

    // when
    // - A requisição POST é feita para /companies/:code/persons com token válido
    const response = await request(app.getHttpServer())
      .post(`/companies/${newCompany.code}/person`)
      .send(person)
      .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });

    // - A resposta deve conter status 201 Created
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(new PersonResources(response.body))
  });

  // it('should deny access to user without can_write_people role', async () => {
  //   // given
  //   // - Usuário com perfil manager mas sem role adequada
  
  //   // when
  //   // - A requisição POST é feita para criar pessoa
  
  //   // then
  //   // - A resposta deve conter status 403 Forbidden
  // });

  // it('should allow user with can_read_people role to list people', async () => {
  //   // given
  //   // - Usuário autenticado com role can_read_people
  
  //   // when
  //   // - A requisição GET /companies/:code/persons é feita
  
  //   // then
  //   // - Deve retornar status 200 com a lista de pessoas cadastradas
  // });

  // it('should not allow creating a person with a duplicate email in the same company', async () => {
  //   // given
  //   // - Pessoa já cadastrada na empresa com determinado e-mail
  
  //   // when
  //   // - Outra pessoa é cadastrada com o mesmo e-mail
  
  //   // then
  //   // - Deve retornar status 400 com mensagem de erro de duplicidade
  // });

  // it('should allow admin user with can_write_people role to create a person in any company', async () => {
  //   // given
  //   // - Usuário com perfil admin e role can_write_people
  
  //   // when
  //   // - Admin envia payload para empresa diferente da sua
  
  //   // then
  //   // - Pessoa deve ser criada corretamente
  // });
  
  afterAll(async () => {
    await app.close();
  });
});
