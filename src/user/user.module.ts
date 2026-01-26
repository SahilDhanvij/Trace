import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonModule } from 'src/common/common.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [CommonModule],
  exports : [UserService]
})
export class UserModule {}
