import { Users } from 'src/entities/user.entity';

interface UserResource {
  code: string;
  email: string;
  name: string;
  document: string;
  phone: string;
}

export class UserResources implements UserResource {
  code: string;
  email: string;
  name: string;
  document: string;
  phone: string;

  constructor(payload: Partial<Users>) {
    this.code = payload.code;
    this.email = payload.email;
    this.name = payload.name;
    this.document = payload.document;
    this.phone = payload.phone;
  }
}
