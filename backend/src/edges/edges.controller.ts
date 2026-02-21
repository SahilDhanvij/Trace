import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { EdgesService } from './edges.service';
import { createEdgeDTO } from 'src/DTO/create-edgeDTO';

@Controller('edges')
export class EdgesController {
    constructor(
        private readonly edgesService : EdgesService
    ) {}

    @Post()
    createEdge(@Req() req, @Body() dto : createEdgeDTO){
        return this.edgesService.createEdge(req.user.userId, dto);
    }

    @Get()
    getUserEdges(@Req() req){
        return this.edgesService.getUserEdges(req.user.userId);
    }

    @Delete(':id')
    deleteEdge(@Req() req, @Param('id') edgeId : string){
        return this.edgesService.deleteEdge(req.user.userId, edgeId);
    }
}
