import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Company } from "src/entities/company.entity";
import { Repository } from "typeorm";
import { CompanyCodeDTO, CompanyStoreDTO } from "../dto/company.dto";
import { DeviceShowDTO, DeviceStoreDTO, DeviceUpdateDTO } from "../dto/device.dto";
import { Device } from "src/entities/device.entity";
import { CompanyService } from "./company.service";
import { AxiosService } from "src/shared/services/axios.service";
import { EncrypterService } from "src/shared/services/encrypter.service";
import { AxiosResponse } from "axios";
import { RedisService } from "src/shared/services/redis.service";

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name)

  constructor (
    @InjectRepository(Device) private devicesRepository: Repository<Device>,
    @Inject() private companiesService: CompanyService,
    @Inject() private readonly axiosService: AxiosService,
    @Inject() private encrypterService: EncrypterService,
    @Inject() private readonly redisService: RedisService
  ) {}

  async store (company_code: CompanyCodeDTO['company_code'], payload: DeviceStoreDTO): Promise<Device> {
    try {
      const company = await this.companiesService.show(company_code)

      const { encrypted, iv } = this.encrypterService.encryptPassword(payload.password)

      const newDevice = await this.devicesRepository.save({
        ...payload,
        company,
        password: encrypted,
        iv,
        is_active: false
      })

      for (let attempt=1;attempt<=2;attempt++) {
        try {
          const deviceLogin = await this.loginOnDevice(newDevice)
    
          if (deviceLogin.status === 200) {
            await this.update(newDevice.code, { is_active: true })

            // XXX TODO :: Como o ttl é de 1 hora, preciso
            // adicionar uma validação da sessão nas requisições do dispositivo
            await this.redisService.set(`device:session:${newDevice.code}`, deviceLogin.data.session, 3600)

            break;
          }
        } catch (e) {
          console.log(e)
          this.logger.warn(`Tentativa ${attempt} de login para o dispositivo ${newDevice.name}`)

          if (attempt === 2) this.logger.error(`Falha ao logar no dispositivo ${newDevice.name} após 2 tentativas`)
        }
      }

      return newDevice
    } catch(e) {
      throw e
    }
  }

  private async loginOnDevice (device: Device): Promise<AxiosResponse> {
    const client = await this.axiosService.setup(`http://${device.ip_address}`)

    const response = await client.post('/login.fcgi', { user: device.user, password: this.encrypterService.decryptPassword(device.password, device.iv) })

    return response
  }

  async list (company_code: CompanyCodeDTO['company_code']): Promise<Device[]> {
    try {
      const devices = await this.devicesRepository.find({
        where: {
          company: {
            code: company_code
          }
        },
        relations: {
          company: true
        }
      })

      return devices
    } catch (e) {
      throw e
    }
  }
  
  async show (code: DeviceShowDTO['device_code']): Promise<Device> {
    try {
      const device = await this.devicesRepository.findOne({
        where: {
          code
        },
        relations: {
          company: true
        }
      })

      if (!device) throw new NotFoundException('Device not found!')

      return device
    } catch (e) {
      throw e
    }
  }

  async update (code: DeviceShowDTO['device_code'], payload: DeviceUpdateDTO): Promise<Device> {
    try {
      await this.devicesRepository.update({ code }, payload)
      
      const device = await this.devicesRepository.findOne({ where: { code }, relations: { company: true } })

      return device
    } catch (e) {
      throw e
    }
  }
}