import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleDto } from 'src/DTO/googleDTO';
import { RefreshTokenDto } from 'src/DTO/refreshTokenDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  loginWithGoogle(@Body() dto: GoogleDto) {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.exchangeRefreshToken(dto.refreshToken);
  }
}
