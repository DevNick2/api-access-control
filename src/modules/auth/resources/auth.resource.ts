import { AuthDTO } from '../dto/auth.dto';

interface AuthResource {
  token: string;
  refresh_token: string;
}

export class AuthResources implements AuthResource {
  token: string;
  refresh_token: string;

  constructor(payload: Partial<AuthDTO>) {
    this.refresh_token = payload?.refresh_token || '';
    this.token = payload?.token || '';
  }
}
