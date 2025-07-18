import { hash, compare } from 'bcryptjs';

export class HashHelpers {
  async generateHash(password: string): Promise<string> {
    return (await hash(password, 8)).toString();
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }
}
