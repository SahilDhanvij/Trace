import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtService } from './jwt/jwt.service';
import { createHash, hash } from 'crypto';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createRefreshToken(userId: string) {
    const refreshToken = this.jwtService.generateRefreshToken({ id: userId });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        hash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return refreshToken;
  }

  async rotateRefreshToken(
    incomingToken: string,
  ): Promise<{ userId: string; refreshToken: string }> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verifyRefreshToken(incomingToken);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const hashValue = hashToken(incomingToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        hash: hashValue,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!storedToken) {
      throw new Error('Refresh token not found or expired');
    }
    await this.prisma.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    });
    const newRefreshToken = await this.createRefreshToken(storedToken.userId);

    return {
      userId: storedToken.userId,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshTokens(userId: string) {
    const hashValue = hashToken(userId);
    await this.prisma.refreshToken.deleteMany({
      where: {
        hash : hashValue,
      },
    });
  }
}
