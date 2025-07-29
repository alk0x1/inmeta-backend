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

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}