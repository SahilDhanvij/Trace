import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { createEdgeDTO } from 'src/DTO/create-edgeDTO';

@Injectable()
export class EdgesService {
    constructor(
        private readonly prisma : PrismaService
    ) {}

    async createEdge(userId : string, dto : createEdgeDTO){
        if(dto.fromId === dto.toId){
            throw new BadRequestException("Cannot create edge to the same node");
        }
        const nodes = await this.prisma.node.findMany({
            where: {
                id: { in: [dto.fromId, dto.toId] },
                userId,
            },
        });
        if(nodes.length !== 2){
            throw new NotFoundException("Node not found");
        }
        return this.prisma.edge.upsert({
            where: {
                userId_fromId_toId: {
                    userId,
                    fromId: dto.fromId,
                    toId: dto.toId,
                },
            },
            update: {},
            create: {
                userId,
                fromId: dto.fromId,
                toId: dto.toId,
                traveledAt: dto.traveledAt ? new Date(dto.traveledAt) : null,
            },
        });
    }

    async getUserEdges(userId : string){
        return this.prisma.edge.findMany({
            where : {userId},
            orderBy : {createdAt : 'desc'},
        })
    }

    async deleteEdge(userId : string, edgeId : string){
        const edge = await this.prisma.edge.findFirst({
            where : {id : edgeId, userId}
        })
        if(!edge){
            throw new NotFoundException("Edge not found");
        }
        await this.prisma.edge.delete({
            where : {id : edgeId}
        })
        return {success : true};
    }

}
