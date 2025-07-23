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

describe('Devices management', () => {
  let app
  let jwtService: JwtService
  let reflector: Reflector
  let redisService: RedisService
  let companyService: CompanyService
  let userRepository: MockType<Repository<User>>;
  let database: DataSource
  let hashHelpers: HashHelpers
  let axiosService: AxiosService
  let encrypterService: EncrypterService
  let deviceService: DeviceService
  let mockPost

  beforeAll(async () => {
    database = await TestingDatabaseInitialize()
  })

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({
      realDatabase: [Company, User, Role, Device],
    });

    userRepository = testingModule.get<MockType<Repository<User>>>(
      getRepositoryToken(User),
    );

    companyService = testingModule.get<CompanyService>(CompanyService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers)
    jwtService = testingModule.get<JwtService>(JwtService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers);
    deviceService = testingModule.get<DeviceService>(DeviceService)
    reflector = testingModule.get<Reflector>(Reflector);
    axiosService = testingModule.get<AxiosService>(AxiosService);
    encrypterService = testingModule.get<EncrypterService>(EncrypterService);
    redisService = testingModule.get<RedisService>(RedisService);

    redisService.set = jest.fn();
    
    const mockAxiosResponse: AxiosResponse = {
      data: { session: 'session-token-xyz' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined
      },
    };

    mockPost = jest.fn().mockResolvedValue(mockAxiosResponse);

    const mockAxiosInstance = {
      post: mockPost,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as unknown as AxiosInstance;
    
    axiosService.setup = jest.fn().mockResolvedValue(mockAxiosInstance);

    app = testingModule.createNestApplication();

    await app.init();
  });

  it('should allow an admin to create a device with valid data', async () => {
    // given: an authenticated user with profile "admin"
    const newUser = await database.manager.save(User, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.ADMIN,
      is_temporary_password: false,
      roles: undefined
    })
    // and: an valid company
    const newCompany = await database.manager.save(Company, {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
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

    // and: a valid payload with name, ip_address, username and password
    const device: DeviceStoreDTO = {
      name: 'Device 1',
      ip_address: faker.internet.ipv4(),
      user: "admin",
      password: "admin"
    }
    // when: POST /devices is called
    const response = await request(app.getHttpServer())
    .post(`/companies/${newCompany.code}/devices`)
    .send(device)
    .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });
    
    // then: return 201 Created with the device data
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(new DeviceResources(response.body))
  });

  it('should allow a manager to create a device with valid data', async () => {
    // given: an authenticated user with profile "manager"
    const newUser = await database.manager.save(User, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: UserProfile.MANAGER,
      is_temporary_password: false,
      roles: undefined
    })
    // and: an valid company
    const newCompany = await database.manager.save(Company, {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
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
    
    // and: a valid payload with name, ip_address, username and password
    const device: DeviceStoreDTO = {
      name: 'Device 1',
      ip_address: faker.internet.ipv4(),
      user: "admin",
      password: "admin"
    }
    // when: POST /devices is called
    const response = await request(app.getHttpServer())
    .post(`/companies/${newCompany.code}/devices`)
    .send(device)
    .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });
    
    // then: return 201 Created with the device data
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(new DeviceResources(response.body))
  });

  it('should save device and store session token in Redis', async () => {
    // Prepare
    const company = await database.manager.save(Company, {
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: '62.474.065/0001-26'
    })
    const device: DeviceStoreDTO = {
      name: faker.company.name(),
      ip_address: faker.internet.ipv4(),
      user: 'admin',
      password: 'admin123',
    }
    
    // when
    const newDevice = await deviceService.store(company.code, device)

    // then
    expect(axiosService.setup).toHaveBeenCalledWith(`http://${device.ip_address}`)
    expect(mockPost).toHaveBeenCalledWith(
      '/login.fcgi',
      { user: device.user, password: device.password },
    );
    expect(redisService.set).toHaveBeenCalledWith(
      `device:session:${newDevice.code}`,
      'session-token-xyz',
      3600, // 1 hora ou tempo definido
    );
  });

  // it('should reject creation if a device with the same IP already exists', async () => {
  //   // given: a device already exists with a specific IP
  //   // when: a new device is created with that same IP
  //   // then: return 400 Bad Request with duplication error
  // });

  // it('should return a list of devices for the user’s company', async () => {
  //   // given: an authenticated user with profile "admin" or "manager"
  //   // and: multiple devices exist for the same company
  //   // when: GET /devices is called
  //   // then: return 200 OK with a list of devices
  // });

  // it('should reject device creation if user is not admin or manager', async () => {
  //   // given: a user with profile "user"
  //   // when: POST /devices is called
  //   // then: return 403 Forbidden
  // });

  // it('should reject listing devices for users without proper role', async () => {
  //   // given: a user with profile "user"
  //   // when: GET /devices is called
  //   // then: return 403 Forbidden
  // });

  // it('should allow an admin or manager to update device data', async () => {
  //   // given: a device exists with code X
  //   // and: a valid update payload (ex: new name or active = false)
  //   // when: PATCH /devices/:code is called
  //   // then: return 200 OK with updated device
  // });

  // it('should return access logs for a given device if user is authorized', async () => {
  //   // given: a device exists with logs
  //   // and: an authenticated admin or manager
  //   // when: GET /devices/:code/logs is called
  //   // then: return 200 OK with log list
  // });

  it('should encrypt and decrypt a device password correctly', () => {
    // given: a raw password for a device
    const devicePassword = 'admin'

    // when: the password is encrypted using encryptPassword()
    const { encrypted, iv } = encrypterService.encryptPassword(devicePassword)
    // then: encrypted_password and iv are generated and returned

    expect(encrypted).toBeDefined()
    expect(iv).toBeDefined()

    // and: the encrypted password is decrypted using decryptPassword()
    const decryptedPassword = encrypterService.decryptPassword(encrypted, iv)
  
    // then: the result should match the original password
    expect(decryptedPassword).toBe(devicePassword)
  });
  it('should throw an error if IV is invalid or malformed', () => {
    // given: a valid encrypted password
    const devicePassword = 'admin'
    const { encrypted, iv } = encrypterService.encryptPassword(devicePassword)

    // and: a malformed or truncated IV
    const corruptedIv = iv.slice(0, 10); // truncado

    // when: decryptPassword() is called with the invalid IV
    // then: it should throw an error during decryption
    expect(() => encrypterService.decryptPassword(encrypted, corruptedIv)).toThrow('Invalid initialization vector')
  });
  it('should throw an error if encrypted password is corrupted', () => {
    const devicePassword = 'admin'
    const { encrypted, iv } = encrypterService.encryptPassword(devicePassword)
    
    // given: an invalid encrypted password (wrong hex or tampered)
    const encryptedCorruptedPassword = encrypted.slice(0, encrypted.length - 4)
    
    // when: decryptPassword() is called
    // then: it should throw an error due to decryption failure
    // and: a malformed or truncated IV
    expect(() => encrypterService.decryptPassword(encryptedCorruptedPassword, iv)).toThrow()
  });
  
  afterAll(async () => {
    await app.close();
  });
});
