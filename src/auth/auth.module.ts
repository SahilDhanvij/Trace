import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { googleService } from './google/googleService';
import { JwtService } from './jwt/jwt.service';
@Module({
  controllers: [AuthController],
  providers: [AuthService, googleService, JwtService],
  imports : [UserModule]
})
export class AuthModule {}
