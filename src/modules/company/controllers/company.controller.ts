import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "src/shared/decorators/roles.decorator";
import { CompanyCodeDTO, CompanyStoreDTO } from "../dto/company.dto";
import { RolesGuard } from "src/shared/guard/roles.guard";
import { CompanyService } from "../services/company.service";
import { CompanyResources } from "../resources/company.resource";
import { UserStoreDTO } from "src/modules/auth/dto/user.dto";
import { UserResources } from "src/modules/auth/resources/user.resource";
import { UserService } from "src/modules/auth/services/user.service";
import { DeviceStoreDTO } from "../dto/device.dto";
import { DeviceService } from "../services/device.service";
import { DeviceResources } from "../resources/device.resource";
import { RolesList } from "src/entities/role.entity";
import { PersonCodeDTO, PersonStoreDTO } from "../dto/person.dto";
import { PersonResources } from "../resources/person.resources";
import { PersonService } from "../services/person.service";
import { AccessRuleStoreDTO } from "../dto/access-rule.dto";
import { AccessRuleResources } from "../resources/access-rule.resource";
import { AccessOrchestratorService } from "../services/access-orchestrator.service";

@ApiTags('Company')
@Controller('companies')
@UseGuards(RolesGuard)
export class CompanyController {
  constructor(
    @Inject() private companyService: CompanyService,
    @Inject() private userService: UserService,
    @Inject() private devicesService: DeviceService,
    @Inject() private personService: PersonService,
    @Inject() private accessOrchestratorService: AccessOrchestratorService
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin'] })
  @Post()
  async createCompany(@Body() payload: CompanyStoreDTO): Promise<CompanyResources> {
    const company = await this.companyService.store(payload)

    return new CompanyResources(company);
  }

  // Company Users
  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager'] })
  @Post(':code/users')
  async createUsers(@Body() payload: UserStoreDTO, @Param('code') code: CompanyCodeDTO['company_code']): Promise<UserResources> {
    const user = await this.userService.store({
      ...payload,
      company_code: code
    });

    return new UserResources(user);
  }
  
  // Company Devices
  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager'] })
  @Post(':code/devices')
  async createDevice(@Body() payload: DeviceStoreDTO, @Param('code') code: CompanyCodeDTO['company_code']): Promise<DeviceResources> {
    const device = await this.devicesService.store(code, payload)

    return new DeviceResources(device);
  }
  
  @HttpCode(HttpStatus.OK)
  @Roles({ profile: ['admin', 'manager'] })
  @Get(':code/devices')
  async listDevice(@Param('code') code: CompanyCodeDTO['company_code']): Promise<DeviceResources[]> {
    const devices = await this.devicesService.list(code)

    return DeviceResources.list(devices)
  }

  // Company Person
  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_WRITE_PEOPLE] })
  @Post(':code/person')
  async createPerson(@Param('code') code: CompanyCodeDTO['company_code'], @Body() payload: PersonStoreDTO, @Request() req): Promise<PersonResources> {
    const person = await this.personService.store(code, payload, req.user)

    return new PersonResources(person)
  }

  // Access Rule
  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_WRITE_PEOPLE, RolesList.CAN_WRITE_ACCESS_RULES] })
  @Post(':code/person/:person_code/rules')
  async setRuleToPerson(@Param() params: { code: CompanyCodeDTO['company_code'], person_code: PersonCodeDTO['person_code'] }, @Body() payload: AccessRuleStoreDTO): Promise<AccessRuleResources> {
    const person = await this.personService.show(params.person_code)
    const company = await this.companyService.show(params.code)

    const accessRules = await this.accessOrchestratorService.defineAccessRule(company, person, payload)

    return new AccessRuleResources('')
  }



  // XXX TODO ::
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager'] })
  // @Get(':code/devices/:device_code')
  // async showDevice(@Param() params: DeviceShowDTO): Promise<''> {
  //   return '';
  // }
  
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager'] })
  // @Put(':code/devices')
  // async updateDevice(@Body() payload: DeviceUpdateDTO, @Param('code') param: { code: CompanyCodeDTO['company_code'] }): Promise<''> {
  //   return '';
  // }
  
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager'] })
  // @Delete(':code/devices/:device_code')
  // async deleteDevice(@Param() params: DeviceDeleteDTO): Promise<''> {
  //   return '';
  // }

  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_READ_PEOPLE] })
  // @Get(':code/person')
  // async listPerson(@Param('code') code: CompanyCodeDTO['company_code']): Promise<PersonResources[]> {
  //   const person = await this.personService.list(code)

  //   return PersonResources.list(person)
  // }
  
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_READ_PEOPLE] })
  // @Get(':code/person/:person_code')
  // async showPerson(@Param() params: PersonShowDTO): Promise<PersonResources[]> {
  //   const person = await this.personService.show(params)

  //   return PersonResources.list(person)
  // }
  
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_READ_PEOPLE] })
  // @Put(':code/person/:person_code')
  // async updatePerson(@Param() params: PersonShowDTO, @Body() payload: PersonUpdateDTO): Promise<PersonResources[]> {
  //   const person = await this.personService.update(params, payload)

  //   return new PersonResources(person)
  // }
  
  // @HttpCode(HttpStatus.OK)
  // @Roles({ profile: ['admin', 'manager', 'user'], roles: [RolesList.CAN_WRITE_PEOPLE] })
  // @Delete(':code/person/:person_code')
  // async deletePerson(@Param() params: PersonShowDTO): Promise<PersonResources> {
  //   await this.personService.delete(params)

  //   return true
  // }
}