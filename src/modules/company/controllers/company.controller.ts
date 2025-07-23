import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "src/shared/decorators/roles.decorator";
import { CompanyCodeDTO, CompanyStoreDTO } from "../dto/company.dto";
import { RolesGuard } from "src/shared/guard/roles.guard";
import { CompanyService } from "../services/company.service";
import { CompanyResources } from "../resources/company.resource";
import { UserStoreDTO } from "src/modules/auth/dto/user.dto";
import { UserResources } from "src/modules/auth/resources/user.resource";
import { UserService } from "src/modules/auth/services/user.service";
import { DeviceDeleteDTO, DeviceShowDTO, DeviceStoreDTO, DeviceUpdateDTO } from "../dto/device.dto";
import { DeviceService } from "../services/device.service";
import { DeviceResources } from "../resources/device.resource";
import { RolesList } from "src/entities/role.entity";

@ApiTags('Company')
@Controller('companies')
@UseGuards(RolesGuard)
export class CompanyController {
  constructor(
    @Inject() private companyService: CompanyService,
    @Inject() private userService: UserService,
    @Inject() private devicesService: DeviceService
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin'] })
  @Post()
  async createCompany(@Body() payload: CompanyStoreDTO): Promise<CompanyResources> {
    const company = await this.companyService.store(payload)

    return new CompanyResources(company);
  }

  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager'] })
  @Post(':code/users')
  async createUsers(@Body() payload: UserStoreDTO, @Param(':code') code: CompanyCodeDTO['company_code']): Promise<UserResources> {
    const user = await this.userService.store({
      ...payload,
      company_code: code
    });

    return new UserResources(user);
  }
  
  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin', 'manager'] })
  @Post(':code/devices')
  async createDevice(@Body() payload: DeviceStoreDTO, @Param(':code') code: CompanyCodeDTO['company_code']): Promise<DeviceResources> {
    const device = await this.devicesService.store(code, payload)

    return new DeviceResources(device);
  }
  
  @HttpCode(HttpStatus.OK)
  @Roles({ profile: ['admin', 'manager'] })
  @Get(':code/devices')
  async listDevice(@Param(':code') code: CompanyCodeDTO['company_code']): Promise<DeviceResources[]> {
    const devices = await this.devicesService.list(code)

    return DeviceResources.list(devices)
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
}