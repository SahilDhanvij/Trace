import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { OAuthDTO } from 'src/DTO/oAuthDTO';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService : UserService
    ){}

    @Post('googleOauth')
    async googleLogin(@Body() oAuthDTO : OAuthDTO){
        return this.userService.findOrCreateByGoogleid(oAuthDTO);
    }
}
