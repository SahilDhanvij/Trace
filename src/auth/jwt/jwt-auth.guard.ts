import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//enforces Auth
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
