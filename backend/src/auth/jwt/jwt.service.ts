import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';



// This issues token
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

  generateRefreshToken(user: { id: string }) {
    return this.jwt.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  /** Verifies refresh token and returns payload; throws if invalid or expired. */
  verifyRefreshToken(token: string): { sub: string } {
    return this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as { sub: string };
  }
}
