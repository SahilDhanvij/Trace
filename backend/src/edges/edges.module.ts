import { Module } from '@nestjs/common';
import { EdgesController } from './edges.controller';
import { EdgesService } from './edges.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports : [CommonModule],
  controllers: [EdgesController],
  providers: [EdgesService],
  exports : [EdgesService]
})
export class EdgesModule {}
