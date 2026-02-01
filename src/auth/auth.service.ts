import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { googleService } from './google/googleService';
import { UserService } from 'src/user/user.service';
import { JwtService } from './jwt/jwt.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly googleService: googleService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async loginWithGoogle(idToken: string) {
    const googleUser = await this.googleService.verify(idToken);
    const user = await this.userService.findOrCreateByGoogleid(googleUser);
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        hash: hashToken(refreshToken),
        expiresAt,
      },
    });

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

  async exchangeRefreshToken(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        hash: tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.generateAccessToken(user);
    const newRefreshToken = this.jwtService.generateRefreshToken(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        hash: hashToken(newRefreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
