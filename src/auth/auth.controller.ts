import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';

import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from './cookie.util';
import { GoogleDto } from 'src/DTO/googleDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async loginWithGoogle(
    @Body() dto: GoogleDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.authService.loginWithGoogle(dto.idToken);
    setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if(!refreshToken){
        throw new UnauthorizedException('Missing refresh token');
    }
    const{accessToken, refreshToken : newRefreshToken} = await this.authService.exchangeRefreshToken(refreshToken);
    setRefreshTokenCookie(res, newRefreshToken);
    return {
      accessToken,
    };
  }

  @Post('logout')
  async logOut(@Req() req : express.Request, @Res({passthrough : true}) res : express.Response) {
    const refreshToken = req.cookies?.refresh_token;
    if(refreshToken){
        await this.authService.logOut(refreshToken);
    }
    clearRefreshTokenCookie(res);
    return { success : true };
  }
}
