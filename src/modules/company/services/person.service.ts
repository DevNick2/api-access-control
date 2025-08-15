import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Person, PersonType } from "src/entities/person.entity";
import { User } from "src/entities/user.entity";
import { CompanyCodeDTO } from "src/modules/company/dto/company.dto";
import { PersonCodeDTO, PersonStoreDTO } from "src/modules/company/dto/person.dto";
import { CompanyService } from "src/modules/company/services/company.service";
import { Repository } from "typeorm";
import { DeviceService } from "./device.service";

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name)

  constructor(
    @InjectRepository(Person) private personRepository: Repository<Person>,

    @Inject() private companyService: CompanyService,
    @Inject() private devicesService: DeviceService
  ) {}

  async store (company_code: CompanyCodeDTO['company_code'], payload: PersonStoreDTO, user: User): Promise<Person> {
    try {
      const company = await this.companyService.show(company_code)

      const person = await this.personRepository.save({
        ...payload,
        company,
        is_active: true,
        user
      })

      const dispatch = await this.devicesService.dispatchToDevices(company.code, {
        object: 'user',
        values: [{
          name: person.name,
          email: person.email || '',
          user_type_id: person.person_type === PersonType.SERVICE_PROVIDER || PersonType.VISITOR ? 1 : null
        }]
      })
      
      for(const item of dispatch) {
        if (item.response.status !== 200) this.logger.warn(`Não foi possível sincronizar a pessoa ${person.name} no dispositivo ${item.device.name}`)
      }

      return person
    } catch (e) {
      throw e
    }
  }

  async show (code: PersonCodeDTO['person_code']): Promise<Person> {
    try {
      const person = await this.personRepository.findOne({
        where: {
          code
        },
      })

      if (!person) throw new NotFoundException('Person not found!')

      return person
    } catch (e) {
      throw e
    }
  }
}