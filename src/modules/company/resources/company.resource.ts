import { Company } from 'src/entities/company.entity';

interface CompanyResource {
  code: string;
  name: string;
  cnpj: string;
  domain: string;
}

export class CompanyResources implements CompanyResource {
  code: string;
  name: string;
  cnpj: string;
  domain: string;

  constructor(payload: Partial<Company>) {
    this.code = payload.code;
    this.name = payload.name;
    this.cnpj = payload.cnpj;
    this.domain = payload.domain;
  }
}
