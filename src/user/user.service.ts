import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OAuthDTO } from 'src/DTO/oAuthDTO';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma : PrismaService
    ){}


    async findOrCreateByGoogleid(oAuthDTO : OAuthDTO){
        return this.prisma.user.upsert({
            where : {googleId : oAuthDTO.googleId},
            update : {},
            create :{
                googleId : oAuthDTO.googleId,
                email : oAuthDTO.email,
                name : oAuthDTO.name
            },
        });
    }
    
}
