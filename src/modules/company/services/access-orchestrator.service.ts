import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessRule } from "src/entities/access_rule.entity";
import { AccessRuleTimeZone } from "src/entities/access_rule_time_zone.entity";
import { PersonAccessRule } from "src/entities/person_access_rule.entity";
import { TimeSpan } from "src/entities/time_span.entity";
import { TimeZone } from "src/entities/time_zone.entity";
import { Brackets, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { AccessRuleStoreDTO } from "../dto/access-rule.dto";
import { Company } from "src/entities/company.entity";
import { Person } from "src/entities/person.entity";
import moment from "moment";

@Injectable()
export class AccessOrchestratorService {
  constructor (
    @InjectRepository(AccessRuleTimeZone) private accessRuleTimeZoneRepository: Repository<AccessRuleTimeZone>,
    @InjectRepository(PersonAccessRule) private personAccessRule: Repository<PersonAccessRule>,
    @InjectRepository(AccessRule) private accessRuleRepository: Repository<AccessRule>,
    @InjectRepository(TimeSpan) private timeSpanRepository: Repository<TimeSpan>,
    @InjectRepository(TimeZone) private timeZoneRepository: Repository<TimeZone>,
  ) {}

  async defineAccessRule (company: Company, person: Person, payload: AccessRuleStoreDTO) {
    try {
      /*
        tem a pessoa
        tem a company
        
        cria o conjunto de regras no access_rule
        cria o vinculo no person_access_rule

        cria os períodos de tempo no time_span
        cria o conjunto de tempo no time_zone

        cria o vinculo no access_rule_time_zone
      */

      const rangeSet = await this.createRangeSet(company, person)
      
      const intervals = await this.createIntervalsFromSchedule(rangeSet, payload)
      
      const accessRule = await this.createAccessRule(company)

      await this.joinPersonToAccessRule(accessRule, person)
      await this.joinAccessRulesToRangeSet(accessRule, rangeSet)
      
      return {
        person,
        range_set: {
          name: rangeSet.name,
          intervals
        }
      }
    } catch (e) {
      throw e
    }
  }

  async createAccessRule (company: Company): Promise<AccessRule> {
    try {
      const accessRule = await this.accessRuleRepository.save(company)

      return accessRule
    } catch (e) {
      throw e
    }
  }
  async joinPersonToAccessRule (access_rule: AccessRule, person: Person): Promise<PersonAccessRule> {
    try {
      const personAccessRule = await this.personAccessRule.save({
        access_rule,
        person
      })

      return personAccessRule
    } catch (e) {
      throw e
    }
  }
  async createRangeSet (company: Company, person: Person): Promise<TimeZone> {
    try {
      const timeZone = await this.timeZoneRepository.save({
        company,
        name: `${person.name}:${person.code}`
      })

      return timeZone
    } catch (e) {
      throw e
    }
  }
  async createIntervalsFromSchedule (time_zone: TimeZone, payload: AccessRuleStoreDTO): Promise<TimeSpan> {
    try {
      if (!!payload.end_time.isBefore(payload.start_time)) throw new BadRequestException('the end time cannot be greater than the start time!')

      const existsTimeSpan = await this.timeSpanRepository.createQueryBuilder()
        .where('weekday IN (:weekdays)', { weekdays: payload.weekday })
        .andWhere(
          new Brackets((qb) => {
            qb.orWhere(
              new Brackets((sqb) => {
                sqb
                  .where('start_time >= :start_time', { start_time: payload.start_time.format('HH:mm') })
                  .andWhere('end_time <= :end_time', { end_time: payload.end_time.format('HH:mm') })
              })
            )
            qb.orWhere(
              new Brackets((sqb) => {
                sqb
                  .where('start_time >= :start_time', { start_time: payload.start_time.format('HH:mm') })
                  .orWhere('end_time <= :end_time', { end_time: payload.end_time.format('HH:mm') })
              })
            )
          })
        )
        .getOne()

      if(existsTimeSpan) throw new BadRequestException('There is already an access rule for this range!')

      const timeSpan = await this.timeSpanRepository.save({
        time_zone,
        ...payload
      })

      return timeSpan
    } catch (e) {
      throw e
    }
  }
  async joinAccessRulesToRangeSet (access_rule: AccessRule, time_zone: TimeZone): Promise<AccessRuleTimeZone> {
    try {
      const accessRuleTimeZone = await this.accessRuleTimeZoneRepository.save({
        access_rule,
        time_zone
      })

      return accessRuleTimeZone
    } catch (e) {
      throw e
    }
  }
}