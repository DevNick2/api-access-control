import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

@Injectable()
export class EncrypterService {
  private readonly secretKey: Buffer

  constructor(@Inject() private configService: ConfigService) {
    const rawKey = this.configService.get('DEVICE_CRYPTO_SECRET')

    this.secretKey = scryptSync(rawKey, 'device_salt', 32) // deriva chave AES-256
  }

  encryptPassword(password: string): { encrypted: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  decryptPassword(encrypted: string, ivHex: string): string {
    const decipher = createDecipheriv('aes-256-cbc', this.secretKey, Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}