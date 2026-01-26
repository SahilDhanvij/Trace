import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { googleService } from './google/googleService';
@Module({
  controllers: [AuthController],
  providers: [AuthService, googleService],
  imports : [UserModule]
})
export class AuthModule {}
