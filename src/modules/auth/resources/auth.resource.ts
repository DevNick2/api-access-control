import { AuthDTO } from '../dto/auth.dto';

interface AuthResource {
  access_token: string;
  refresh_token: string;
}

export class AuthResources implements AuthResource {
  access_token: string;
  refresh_token: string;

  constructor(payload: Partial<AuthDTO>) {
    this.refresh_token = payload?.refresh_token || '';
    this.access_token = payload?.access_token || '';
  }
}
