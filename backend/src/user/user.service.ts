import { Injectable, NotFoundException } from '@nestjs/common';
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

    async findById(userId : string){
        return this.prisma.user.findUnique({
            where : {id : userId}
        });
    }

    async setHomeNode(userId : string, nodeId : string){
        const node = await this.prisma.node.findFirst({
            where : {id : nodeId, userId},
        })
        if(!node){
            throw new NotFoundException('Node not found');
        }
        return this.prisma.user.update({
            where : {id : userId},
            data : {homeNodeId : nodeId},
            select : {
                id : true,
                name : true,
                email : true,
                homeNodeId : true
            }
        });
    }
    
}
