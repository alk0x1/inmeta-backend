import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Environment } from './env.interface';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Environment>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV');
  }

  get port(): number {
    return this.configService.get('PORT');
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL');
  }

  get awsRegion(): string {
    return this.configService.get('AWS_REGION');
  }

  get awsAccessKeyId(): string {
    return this.configService.get('AWS_ACCESS_KEY_ID');
  }

  get awsSecretAccessKey(): string {
    return this.configService.get('AWS_SECRET_ACCESS_KEY');
  }

  get awsS3Bucket(): string {
    return this.configService.get('AWS_S3_BUCKET');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get awsConfig() {
    return {
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    };
  }
}