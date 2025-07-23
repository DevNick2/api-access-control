import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Company } from "src/entities/company.entity";
import { Repository } from "typeorm";
import { CompanyCodeDTO, CompanyStoreDTO } from "../dto/company.dto";
import { RedisService } from "src/shared/services/redis.service";

@Injectable()
export class CompanyService {
  constructor (
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @Inject() private readonly redisService: RedisService
  ) {}

  async store (payload: CompanyStoreDTO): Promise<Company> {
    try {
      const company = await this.companiesRepository.save(payload)

      return company
    } catch(e) {
      throw e
    }
  }

  async show (code: CompanyCodeDTO['company_code']): Promise<Company> {
    try {
      const company = await this.companiesRepository.findOne({
        where: {
          code
        }
      })

      if (!company) throw new NotFoundException('Company not found!')

      return company
    } catch (e) {
      throw e
    }
  }
}