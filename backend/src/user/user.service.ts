import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OAuthDTO } from 'src/DTO/oAuthDTO';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma : PrismaService
    ){}


    async findOrCreateByGoogleid(oAuthDTO : OAuthDTO){
        const existing = await this.prisma.user.findUnique({
            where : {googleId : oAuthDTO.googleId},
        });
        if(existing) return existing;

        try {
            return await this.prisma.user.create({
                data :{
                    googleId : oAuthDTO.googleId,
                    email : oAuthDTO.email,
                    name : oAuthDTO.name
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(
                    'This account uses email/password sign-in. Please log in with your email and password.',
                );
            }
            throw error;
        }
    }

    async findById(userId : string){
        return this.prisma.user.findUnique({
            where : {id : userId}
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async createWithPassword(name: string, email: string, passwordHash: string) {
        return this.prisma.user.create({
            data: { name, email, passwordHash },
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
