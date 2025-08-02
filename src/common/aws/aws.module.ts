import { Module, Global } from '@nestjs/common';
import { AwsService } from '../services/aws.service';

@Global()
@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}