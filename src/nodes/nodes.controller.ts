import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeDTO } from 'src/DTO/create-nodeDTO';
import { GetNodesQueryDto } from 'src/DTO/get-nodeDTO';

@Controller('nodes')
export class NodesController {
    constructor(
        private readonly nodeService : NodesService
    ){}

    @Post()
    async createNode(@Req() req, @Body() dto : CreateNodeDTO){
        return this.nodeService.createNode(req.user.id, dto);
    }

    @Get()
    async getUserNodes(@Req() req, @Query() query : GetNodesQueryDto){
        return this.nodeService.getUserNodes(req.user.id, query);
    }

    @Get(':id')
    async getNodeById(@Req() req, @Param('id') nodeId : string){
        return this.nodeService.getNodeById(req.user.id, nodeId);    
    }

    @Delete(':id')
    async deleteNode(@Req() req, @Param('id') nodeId : string){
        return this.nodeService.deleteNode(req.user.id, nodeId);    
    }

}
