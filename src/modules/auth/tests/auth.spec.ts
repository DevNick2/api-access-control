import { TestingAuthModule } from 'src/shared/test/utils/setup.util';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/user.entity';
import { MockType } from 'src/shared/test/utils/__util';
import { getRepositoryToken } from '@nestjs/typeorm';
import { generateRandomUser } from 'src/shared/test/utils/__mocks';
import { HashHelpers } from 'src/shared/helpers/hash.helper';
import { BadRequestException } from '@nestjs/common';
import { ErrorsHelpers } from 'src/shared/helpers/errors.helper';
import { AuthService } from '../services/auth.service';
import { Reflector } from '@nestjs/core';
import { faker } from '@faker-js/faker/.';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as request from 'supertest';
import { UserResources } from '../resources/user.resource';

describe('AuthService', () => {
  let app;
  let jwtService: JwtService;
  let reflector: Reflector;
  let authService: AuthService;
  let hashHelpers: HashHelpers;
  let userRepository: MockType<Repository<Users>>;

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({ withMockedDatabase: true });

    userRepository = testingModule.get<MockType<Repository<Users>>>(
      getRepositoryToken(Users),
    );
    authService = testingModule.get<AuthService>(AuthService);
    jwtService = testingModule.get<JwtService>(JwtService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers);
    reflector = testingModule.get<Reflector>(Reflector);

    app = testingModule.createNestApplication();

    await app.init();
  });

  it('authenticate user on signIn', async () => {
    const user = generateRandomUser();

    userRepository.findOne.mockReturnValue({
      ...user,
      password: await hashHelpers.generateHash(user.password),
    });

    const userFound = await authService.authenticate({
      email: user.email,
      password: user.password,
    });

    expect(userFound).toBeTruthy();
    expect(userFound.code).toBe(user.code);
  });

  it('should not found error when try login with user that not exists', async () => {
    const user = generateRandomUser();

    userRepository.findOne.mockReturnValue(null);

    const userNotFound = authService.authenticate({
      email: user.email,
      password: user.password,
    });

    await expect(userNotFound).rejects.toThrow(BadRequestException);
    await expect(userNotFound).rejects.toThrow(
      ErrorsHelpers.CREDENTIALS_INVALID,
    );
  });

  it('show user don´t verified when login', async () => {
    const user = generateRandomUser();

    user.verified = false;

    userRepository.findOne.mockReturnValue({
      ...user,
      password: await hashHelpers.generateHash(user.password),
    });

    const userFound = authService.authenticate({
      email: user.email,
      password: user.password,
    });

    await expect(userFound).rejects.toThrow(BadRequestException);
    await expect(userFound).rejects.toThrow(ErrorsHelpers.USER_NOT_VERIFIED);
  });

  it('a valid otp code must have been generated', async () => {
    const otp = authService.generateOtp();

    expect(otp.otp.toString()).toHaveLength(6);
  });

  // E2E
  it('should return user authenticated on auth/me', async () => {
    // Generate a random user
    const user = generateRandomUser();

    const jwt = faker.internet.jwt({
      payload: { exp: faker.date.soon() },
    });

    // Mock ReflectorClass to check Decorator IS_PUBLIC
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    // Mock jwt verify to force JWT Token valid
    jwtService.verifyAsync = jest.fn().mockResolvedValue(true);
    // Mock return of findOne with random user
    userRepository.findOne.mockReturnValue(user);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });

    expect(response.body).toEqual(new UserResources(user));
  });

  it('should return error when try access auth/me with user unauthenticated', async () => {
    const jwt = faker.internet.jwt({
      payload: { exp: faker.date.soon() },
    });

    // Mock ReflectorClass to check Decorator IS_PUBLIC
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    // Mock jwt verify to force JWT Token valid
    jwtService.verifyAsync = jest
      .fn()
      .mockResolvedValue(new TokenExpiredError('jwt expired', new Date()));

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });

    expect(response.body.statusCode).toEqual(401);
  });

  it('should return user with userResource on login', async () => {
    const user = generateRandomUser();

    userRepository.findOne.mockReturnValue({
      ...user,
      password: await hashHelpers.generateHash(user.password),
    });

    userRepository.createQueryBuilder.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockReturnThis(),
    }));

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .set('Accept', 'application/json');

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refresh_token');
  });

  it('should return bad request error when try login with user that not exists', async () => {
    const user = generateRandomUser();

    userRepository.findOne.mockReturnValue(null);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .set('Accept', 'application/json');

    expect(response.body.statusCode).toBe(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
