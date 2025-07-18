import * as aws from '@aws-sdk/client-ses';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';

@Injectable()
export class MailerService {
  private ses: aws.SES;
  private transporter: Transporter<
    SESTransport.SentMessageInfo,
    SESTransport.Options
  >;

  constructor(@Inject() private configService: ConfigService) {
    if (!this.configService.get('SMTP_SECRET_ACCESS_KEY'))
      throw new InternalServerErrorException('Smtp secret is not defined! ');
    if (!this.configService.get('SMTP_ACCESS_KEY'))
      throw new InternalServerErrorException('Smtp access key is not defined!');
    if (!this.configService.get('SMTP_DEFAULT_MAIL_FROM'))
      throw new InternalServerErrorException(
        'Smtp default mail from is not defined!',
      );

    this.ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: 'us-east-1',
      credentials: {
        secretAccessKey: this.configService.get('SMTP_SECRET_ACCESS_KEY'),
        accessKeyId: this.configService.get('SMTP_ACCESS_KEY'),
      },
    });

    this.transporter = createTransport({
      SES: { ses: this.ses, aws },
      sendingRate: 1, // max 1 messages/second,
      maxConnections: 1,
    });
  }

  async deliverEmail({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }) {
    return new Promise(async (resolve) => {
      this.transporter.sendMail(
        {
          from: this.configService.get('SMTP_DEFAULT_MAIL_FROM'),
          to,
          subject,
          html: message,
        },
        (err, info) => {
          this.transporter.close();
          resolve(true);

          if (err) {
            console.log(err);
          } else {
            console.log(info.envelope);
            console.log(info.messageId);
          }
        },
      );

      resolve(true);
    });
  }
}
