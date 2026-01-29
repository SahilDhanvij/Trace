import { Injectable } from '@nestjs/common';
import { googleService } from './google/googleService';
import { UserService } from 'src/user/user.service';
import { JwtService } from './jwt/jwt.service';
import e from 'express';
@Injectable()
export class AuthService {
  constructor(
    private readonly googleService: googleService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithGoogle(idToken: string) {
    const googleUser = await this.googleService.verify(idToken);
    const user = await this.userService.findOrCreateByGoogleid(googleUser);
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
