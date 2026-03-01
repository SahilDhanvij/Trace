import { createHash } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { googleService } from './google/googleService';
import { UserService } from 'src/user/user.service';
import { JwtService } from './jwt/jwt.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from 'src/DTO/registerDTO';
import { LoginDto } from 'src/DTO/loginDTO';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly googleService: googleService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async loginWithGoogle(idToken: string) {
    const googleUser = await this.googleService.verify(idToken);
    const user = await this.userService.findOrCreateByGoogleid(googleUser);
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );
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
    const { userId, refreshToken: newRefreshToken } =
      await this.refreshTokenService.rotateRefreshToken(refreshToken);
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const accessToken = this.jwtService.generateAccessToken(user);
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logOut(refreshToken: string) {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.userService.createWithPassword(
      dto.name,
      dto.email,
      passwordHash,
    );

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

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

  async loginWithEmail(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please log in with Google.',
      );
    }

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

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

  //not needed for prod
  async devLogin(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email },
      });
    }

    const accessToken = this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
    });

    // 🔥 Use your existing refresh token service
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
