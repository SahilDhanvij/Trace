import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { OAuthDTO } from 'src/DTO/oAuthDTO';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService : UserService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req){
        return req.user;
    }

    @Post('googleOauth')
    async googleLogin(@Body() oAuthDTO : OAuthDTO){
        return this.userService.findOrCreateByGoogleid(oAuthDTO);
    }
}
