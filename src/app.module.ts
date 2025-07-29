import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from './config/config.service';
import { envValidationSchema } from './config/env.validation';
import { EmployeeModule } from './modules/employee/employee.module';
import { PrismaModule } from 'prisma/prisma.module';

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
    PrismaModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, ConfigService],
})
export class AppModule {}