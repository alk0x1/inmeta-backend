import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigService } from './config/config.service';
import { envValidationSchema } from './config/env.validation';
import { winstonConfig } from './config/winston.config';
import { EmployeeModule } from './modules/employee/employee.module';
import { DocumentTypeModule } from './modules/document-type/document-type.module';
import { DocumentModule } from './modules/document/document.module';
import { AppLoggerService } from './common/services/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    EmployeeModule,
    DocumentTypeModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService, AppLoggerService],
  exports: [AppLoggerService],
})
export class AppModule {}