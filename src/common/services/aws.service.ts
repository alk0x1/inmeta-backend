import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '../../config/config.service';
import { createS3Client } from '../../config/aws.config';
import { AppLoggerService } from './logger.service';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.s3Client = createS3Client(this.configService);
    this.logger.log('AWS Service initialized', 'AwsService');
  }

  get s3(): S3Client {
    return this.s3Client;
  }

  get bucket(): string {
    return this.configService.awsS3Bucket;
  }

  get region(): string {
    return this.configService.awsRegion;
  }

  isAwsConfigured(): boolean {
    if (this.configService.isDevelopment || this.configService.isTest) {
      return true;
    }

    return !!(
      this.configService.awsAccessKeyId &&
      this.configService.awsSecretAccessKey &&
      this.configService.awsS3Bucket
    );
  }

  logAwsOperation(operation: string, details: any) {
    this.logger.log(`AWS Operation: ${operation} - ${JSON.stringify(details)}`, 'AWS');
  }

  logAwsError(operation: string, error: any) {
    this.logger.error(`AWS Error: ${operation} - ${error.message}`, error.stack, 'AWS');
  }
}