import { User } from 'src/entities/user.entity';

interface UserResource {
  code: string;
  email: string;
  name: string;
}

export class UserResources implements UserResource {
  code: string;
  email: string;
  name: string;

  constructor(payload: Partial<User>) {
    this.code = payload.code;
    this.email = payload.email;
    this.name = payload.name;
  }
}
