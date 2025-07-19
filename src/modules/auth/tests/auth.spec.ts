import { TestingAuthModule } from 'src/shared/test/utils/setup.util';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
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
import { SessionService } from '../services/session.service';

describe('Login and Authentication', () => {
  let app;
  let jwtService: JwtService;
  let reflector: Reflector;
  let authService: AuthService;
  let sessionService: SessionService;
  let hashHelpers: HashHelpers;
  let userRepository: MockType<Repository<User>>;

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({ withMockedDatabase: true });

    userRepository = testingModule.get<MockType<Repository<User>>>(
      getRepositoryToken(User),
    );
    authService = testingModule.get<AuthService>(AuthService);
    sessionService = testingModule.get<SessionService>(SessionService);
    jwtService = testingModule.get<JwtService>(JwtService);
    hashHelpers = testingModule.get<HashHelpers>(HashHelpers);
    reflector = testingModule.get<Reflector>(Reflector);

    app = testingModule.createNestApplication();

    await app.init();
  });

  describe('Login', () => {
    it('should authenticate a valid user and return JWT token', async () => {
      // given: a user with valid email and password exists
      const user = generateRandomUser();

      userRepository.findOne.mockReturnValue({
        ...user,
        password: await hashHelpers.generateHash(user.password),
      });
      userRepository.createQueryBuilder.mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockReturnThis()
      }))

      // when: the user attempts to login
      const authenticated = await authService.authenticate({
        email: user.email,
        password: user.password,
      });

      const openSession = await sessionService.openSession({
        code: authenticated.code,
        email: authenticated.email,
      });

      // then: a valid JWT access token and refresh token are returned
      expect(openSession).toHaveProperty('access_token')
      expect(openSession).toHaveProperty('refresh_token')
    });
  
    // it('should reject login with incorrect password', async () => {
    //   // given: a user exists
    //   // when: incorrect password is provided
    //   // then: authentication fails with 401 Unauthorized
    // });
  });

  // describe('Password Recovery (OTP)', () => {
  //   it('should generate and store a valid OTP for a known email', async () => {
  //     // given: a valid user email
  //     // when: forgot-password is triggered
  //     // then: an OTP code and expiration are saved to the user
  //   });
  
  //   it('should send OTP via email', async () => {
  //     // given: OTP is generated
  //     // then: an email is sent to the user with the code
  //   });
  
  //   it('should allow password reset with valid OTP', async () => {
  //     // given: valid OTP and email
  //     // when: reset-password is called
  //     // then: password is updated and OTP cleared
  //   });
  
  //   it('should reject password reset with invalid or expired OTP', async () => {
  //     // given: expired or incorrect OTP
  //     // when: reset-password is called
  //     // then: return 400 Bad Request
  //   });
  // });

  // describe('Refresh Token', () => {
  //   it('should generate new access token with valid refresh token', async () => {
  //     // given: valid refresh token
  //     // when: POST /auth/refresh-token
  //     // then: return new access and refresh tokens
  //   });
  
  //   it('should reject invalid or expired refresh token', async () => {
  //     // given: expired or unknown refresh token
  //     // when: refresh endpoint is called
  //     // then: return 401 Unauthorized
  //   });
  
  //   it('should delete old refresh token after issuing a new one', async () => {
  //     // given: a refresh is successful
  //     // then: previous token is removed from the database
  //   });
  // });

  describe('GET /me', () => {
    it('should return user info if JWT is valid', async () => {
      // given: a valid access token
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

      // when: user accesses /me
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });

      // then: return current user data
      expect(response.body).toEqual(new UserResources(user));
    });
  
    it('should reject request without token', async () => {
      // when: no token is provided
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({ authorization: '', accept: 'application/json' });

      // then: return 401 Unauthorized
      expect(response.body.statusCode).toEqual(401);
    });
  
    it('should reject request with invalid token', async () => {
      // given: an invalid or tampered token
      const jwt = faker.internet.jwt({
        payload: { exp: faker.date.soon() },
      });
      
      // Mock ReflectorClass to check Decorator IS_PUBLIC
      reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
      // Mock jwt verify to force JWT Token valid
      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue(new TokenExpiredError('jwt expired', new Date()));
      
      // when: /me is called
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({ authorization: 'Bearer ' + jwt, accept: 'application/json' });
      
      // then: return 401 Unauthorized
      expect(response.body.statusCode).toEqual(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
