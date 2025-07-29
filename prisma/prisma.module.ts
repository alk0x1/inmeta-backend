import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '../src/config/config.service';

@Global()
@Module({
  providers: [PrismaService, ConfigService],
  exports: [PrismaService],
})
export class PrismaModule {}