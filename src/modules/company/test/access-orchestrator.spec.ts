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
import { da, faker } from "@faker-js/faker/.";
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
import { AccessOrchestratorService } from "../services/access-orchestrator.service";
import { AccessRuleStoreDTO } from "../dto/access-rule.dto";
import { TimeSpan, TimeSpanWeekday } from "src/entities/time_span.entity";
import { AccessRule } from "src/entities/access_rule.entity";
import { PersonAccessRule } from "src/entities/person_access_rule.entity";
import { AccessRuleTimeZone } from "src/entities/access_rule_time_zone.entity";
import { TimeZone } from "src/entities/time_zone.entity";
import { BadRequestException } from "@nestjs/common";
import * as moment from "moment";

describe('Access Orchestrator', () => {
  let app
  let jwtService: JwtService
  let reflector: Reflector
  let companyService: CompanyService
  let database: DataSource
  let hashHelpers: HashHelpers
  let axiosService: AxiosService
  let deviceService: DeviceService
  let personService: PersonService
  let accessOrchestratorService: AccessOrchestratorService
  let companyRepository: Repository<Company>
  let personAccessRule: Repository<PersonAccessRule>
  let accessRuleRepository: Repository<AccessRule>
  let timeSpanRepository: Repository<TimeSpan>
  let timeZoneRepository: Repository<TimeZone>
  let accessRuleTimeZone: Repository<AccessRuleTimeZone>

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
    accessOrchestratorService = testingModule.get<AccessOrchestratorService>(AccessOrchestratorService);

    companyRepository = database.getRepository(Company)
    personAccessRule = database.getRepository(PersonAccessRule)
    accessRuleRepository = database.getRepository(AccessRule)
    timeSpanRepository = database.getRepository(TimeSpan)
    timeZoneRepository = database.getRepository(TimeZone)
    accessRuleTimeZone = database.getRepository(AccessRuleTimeZone)

    app = testingModule.createNestApplication();

    await app.init();
  });

  it('should create valid intervals for multiple weekdays', async () => {
    /**
     * Dado que o usuário envia horários válidos para os dias úteis
     * Quando a função createIntervalsFromSchedule for executada
     * Então os intervalos devem ser criados corretamente para cada dia
     */

    // Arrange
    const company = await companyRepository.save({
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: faker.number.int(11).toString()
    })
    const timeZone = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })
    const payload: AccessRuleStoreDTO = {
      weekday: [TimeSpanWeekday.MONDAY, TimeSpanWeekday.FRIDAY],
      start_time: moment('16:00', 'HH:mm', true),
      end_time: moment('17:00', 'HH:mm', true)
    }

    // Act
    const intervals = await accessOrchestratorService.createIntervalsFromSchedule(timeZone, payload)

    // Assert
    expect(intervals).toBeTruthy()
    expect(intervals.weekday).toBe(payload.weekday)
  });

  it('should throw error if end_time is earlier than start_time', async () => {
    /**
     * Dado que o usuário envia um horário final menor que o horário inicial
     * Quando a função createIntervalsFromSchedule for executada
     * Então deve lançar um erro de validação informando o conflito
     */

    // Arrange
    const company = await companyRepository.save({
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: faker.number.int(11).toString()
    })
    const timeZone = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })
    const payload: AccessRuleStoreDTO = {
      weekday: [TimeSpanWeekday.MONDAY, TimeSpanWeekday.FRIDAY],
      start_time: moment('18:00', 'HH:mm', true),
      end_time: moment('15:00', 'HH:mm', true)
    }

    // Act
    const intervals = accessOrchestratorService.createIntervalsFromSchedule(timeZone, payload)

    // Assert
    expect(intervals).rejects.toBeInstanceOf(BadRequestException)
    expect(intervals).rejects.toThrow('the end time cannot be greater than the start time!')
  });

  it('should throw error if another time range exists on the same weekday that conflicts', async () => {
    /**
     * Dado que já existe um intervalo cadastrado no sábado das 09:10 às 10:10
     * E o usuário tenta cadastrar outro das 09:30 às 10:00 no mesmo dia
     * Quando a função createIntervalsFromSchedule for executada
     * Então deve lançar um erro informando conflito de horários
     */
    // Arrange
    const company = await companyRepository.save({
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: faker.number.int(11).toString()
    })
    const timeZoneExists = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })
    const payload: AccessRuleStoreDTO = {
      weekday: [TimeSpanWeekday.MONDAY, TimeSpanWeekday.FRIDAY],
      start_time: moment('15:00', 'HH:mm', true),
      end_time: moment('18:00', 'HH:mm', true)
    }
    await timeSpanRepository.save({ time_zone: timeZoneExists, ...payload })

    const timeZoneNew = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })

    // Act
    const intervals = accessOrchestratorService.createIntervalsFromSchedule(timeZoneNew, payload)

    // Assert
    expect(intervals).rejects.toBeInstanceOf(BadRequestException)
    expect(intervals).rejects.toThrow('There is already an access rule for this range!')
  });
 
  it('should throw error when time range conflicts partially in the middle', async () => {
    // Arrange
    const company = await companyRepository.save({
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: faker.number.int(11).toString()
    })
    const timeZoneExists = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })
    const payload: AccessRuleStoreDTO = {
      weekday: [TimeSpanWeekday.MONDAY, TimeSpanWeekday.FRIDAY],
      start_time: moment('09:00', 'HH:mm', true),
      end_time: moment('11:00', 'HH:mm', true)
    }
    // Given: a time span already exists from 09:00 to 11:00
    await timeSpanRepository.save({ time_zone: timeZoneExists, ...payload })

    const timeZoneNew = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })

    // Act
    // When: trying to create a new time span from 10:35 to 15:10 on same weekday
    const intervals = accessOrchestratorService.createIntervalsFromSchedule(timeZoneNew, {
      ...payload,
      start_time: moment('10:35', 'HH:mm', true),
      end_time: moment('15:10', 'HH:mm', true)
    })

    // Assert
    // Then: should throw an error due to overlapping time
    expect(intervals).rejects.toBeInstanceOf(BadRequestException)
    expect(intervals).rejects.toThrow('There is already an access rule for this range!')
  });
  
  it('should throw error when time range starts before but ends within an existing range', async () => {
    // Arrange
    const company = await companyRepository.save({
      name: faker.company.name(),
      domain: faker.company.name().replaceAll(' ', '_'),
      cnpj: faker.number.int(11).toString()
    })
    const timeZoneExists = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })
    const payload: AccessRuleStoreDTO = {
      weekday: [TimeSpanWeekday.MONDAY, TimeSpanWeekday.FRIDAY],
      start_time: moment('14:00', 'HH:mm', true),
      end_time: moment('16:00', 'HH:mm', true)
    }
    // Given: a time span already exists from 14:00 to 16:00
    await timeSpanRepository.save({ time_zone: timeZoneExists, ...payload })

    const timeZoneNew = await timeZoneRepository.save({
      company,
      name: faker.person.fullName().replace(' ', '_ ')
    })

    // Act
    // When: trying to create a new time span from 10:00 to 15:30
    const intervals = accessOrchestratorService.createIntervalsFromSchedule(timeZoneNew, {
      ...payload,
      start_time: moment('10:00', 'HH:mm', true),
      end_time: moment('15:30', 'HH:mm', true)
    })

    // Assert
    // Then: should throw an error due to overlapping time
    expect(intervals).rejects.toBeInstanceOf(BadRequestException)
    expect(intervals).rejects.toThrow('There is already an access rule for this range!')
  });
  
  // it('should allow non-conflicting intervals on same day of the week', async () => {
  //   /**
  //    * Dado que existe um intervalo no sábado das 09:10 às 10:10
  //    * E o usuário envia um novo das 10:11 às 11:00
  //    * Quando a função createIntervalsFromSchedule for executada
  //    * Então deve criar os dois intervalos sem erro
  //    */

  //   // Arrange
  //   const company = await companyRepository.save({
  //     name: faker.company.name(),
  //     domain: faker.company.name().replaceAll(' ', '_'),
  //     cnpj: faker.number.int(11).toString()
  //   })
  //   const payload: AccessRuleStoreDTO = {
  //     weekday: [TimeSpanWeekday.SATURDAY],
  //     start_time: moment('09:10', 'HH:mm', true),
  //     end_time: moment('10:10', 'HH:mm', true)
  //   }

  //   await timeSpanRepository.save({
  //     ...payload,
  //     time_zone: await timeZoneRepository.save({
  //       company,
  //       name: faker.person.fullName().replace(' ', '_ ')
  //     })
  //   })

  //   // Act
  //   const intervals = await accessOrchestratorService.createIntervalsFromSchedule(
  //     await timeZoneRepository.save({
  //     company,
  //     name: faker.person.fullName().replace(' ', '_ ')
  //   }), {
  //     ...payload,
  //     start_time: moment('10:11', 'HH:mm', true),
  //     end_time: moment('11:00', 'HH:mm', true)
  //   })

  //   // Assert
  //   expect(intervals).toBeTruthy()
  //   expect(intervals.weekday).toBe(payload.weekday)
  // });

  // it('should handle single-day interval correctly', async () => {
  //   /**
  //    * Dado que o usuário envia um intervalo válido para quarta-feira das 07:00 às 12:00
  //    * Quando a função createIntervalsFromSchedule for executada
  //    * Então deve retornar um único registro corretamente
  //    */
  // });

  // it('should throw error if weekday is missing or invalid', async () => {
  //   /**
  //    * Dado que o usuário envia um payload sem informar o weekday ou com valores inválidos
  //    * Quando a função createIntervalsFromSchedule for executada
  //    * Então deve lançar um erro de validação sobre o dia da semana
  //    */
  // });
  
  afterAll(async () => {
    await app.close();
  });
});
