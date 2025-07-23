import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role, RolesList } from "src/entities/role.entity";
import { repository, TestingAuthModule } from "../test/utils/setup.util";
import { RolesGuard } from "./roles.guard";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Company } from "src/entities/company.entity";
import { Device } from "src/entities/device.entity";
import { User } from "src/entities/user.entity";

describe('Roles Management', () => {
  let app;
  let reflector: Reflector;
  let rolesGuard: RolesGuard

  beforeEach(async () => {
    const testingModule = await TestingAuthModule({
      mockDatabase: [{
        provide: getRepositoryToken(User),
        useFactory: repository,
      },
      {
        provide: getRepositoryToken(Company),
        useFactory: repository,
      },
      {
        provide: getRepositoryToken(Role),
        useFactory: repository,
      },
      {
        provide: getRepositoryToken(Device),
        useFactory: repository,
      },]
    });

    reflector = testingModule.get<Reflector>(Reflector);
    rolesGuard = testingModule.get<RolesGuard>(RolesGuard)

    app = testingModule.createNestApplication();

    await app.init();
  });
  it('should deny access when user is manager with restricted role can_write_companies', () => {    
    // given: the user has profile "manager" and role "can_write_companies"
     const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            profile: 'manager',
            roles: [RolesList.CAN_WRITE_COMPANIES],
          },
        }),
      }),
      getHandler: () => {},
    };

    reflector.get = jest.fn().mockReturnValue({
      profile: ['admin'],
      roles: [RolesList.CAN_WRITE_COMPANIES],
    });

    // when: the guard is evaluated
    // then: access should be denied with ForbiddenException
    expect(() => rolesGuard.canActivate(context as ExecutionContext)).toThrow(ForbiddenException);
  });
  it('should deny access when user is manager with restricted role can_read_companies', () => {
    // given: the user has profile "manager" and role "can_read_companies"
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            profile: 'manager',
            roles: [RolesList.CAN_READ_COMPANIES],
          },
        }),
      }),
      getHandler: () => {},
    };

    reflector.get = jest.fn().mockReturnValue({
      profile: ['admin'],
      roles: [RolesList.CAN_WRITE_COMPANIES],
    });

    // when: the guard is evaluated
    // then: access should be denied with ForbiddenException
    expect(() => rolesGuard.canActivate(context as ExecutionContext)).toThrow(ForbiddenException);
  });
});
