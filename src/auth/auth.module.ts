import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { googleService } from './google/googleService';
import { JwtService } from './jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from './jwt/jwt-strategy.service';
@Module({
  controllers: [AuthController],
  providers: [AuthService, googleService, JwtService, JwtStrategyService],
  imports : [UserModule, JwtModule.register({})]
})
export class AuthModule {}
