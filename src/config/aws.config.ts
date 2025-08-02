import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from './config.service';

export const createS3Client = (configService: ConfigService): S3Client => {
  if (configService.isDevelopment || configService.isTest) {
    return new S3Client({
      region: configService.awsRegion,
      credentials: {
        accessKeyId: 'mock_access_key',
        secretAccessKey: 'mock_secret_key',
      },
      endpoint: 'http://localhost:4566',
      forcePathStyle: true,
    });
  }

  return new S3Client({
    region: configService.awsRegion,
    credentials: {
      accessKeyId: configService.awsAccessKeyId,
      secretAccessKey: configService.awsSecretAccessKey,
    },
  });
};

export const AWS_CONFIG = {
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_PREFIX: 'documents/',
  TEMP_URL_EXPIRATION: 3600, // 1 hour
};