import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { googleService } from './google/googleService';
import { JwtService } from './jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from './jwt/jwt-strategy.service';
import { CommonModule } from 'src/common/common.module';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [UserModule, CommonModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    googleService,
    JwtService,
    JwtStrategyService,
    RefreshTokenService,
  ]
})
export class AuthModule {}
