import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  generateAccessToken(user: { id: string; email: string }) {
    return this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(user : {id : string}) {
    return this.jwt.sign(
      {
        sub : user.id
      },
      {
        secret : process.env.JWT_REFRESH_SECRET,
        expiresIn : '7d'
      },
    );
  }
}
