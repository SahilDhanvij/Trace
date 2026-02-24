import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateNodeDTO } from 'src/DTO/create-nodeDTO';
import { GetNodesQueryDto } from 'src/DTO/get-nodeDTO';

@Injectable()
export class NodesService {
  constructor(private readonly prisma: PrismaService) {}

  async createNode(userId: string, dto: CreateNodeDTO) {
    const latitude = new Decimal(dto.latitude);
    const longitude = new Decimal(dto.longitude);
    const existingNode = await this.prisma.node.findFirst({
      where: {
        userId,
        latitude,
        longitude,
      },
    });
    if (existingNode) {
      throw new ConflictException(
        'Node with the same coordinates already exists',
      );
    }
    const node = await this.prisma.node.create({
      data: {
        userId,
        name: dto.name,
        latitude,
        longitude,
      },
    });

    return node;
  }

  //gets all nodes of users
  async getUserNodes(userId: string, query?: GetNodesQueryDto) {
    const where: any = { userId };
    if (query?.minLat && query?.maxLat && query?.minLng && query?.maxLng) {
      where.latitude = {
        gte: new Decimal(query.minLat),
        lte: new Decimal(query.maxLat),
      };
      where.longitude = {
        gte: new Decimal(query.minLng),
        lte: new Decimal(query.maxLng),
      };
    }
    const nodes = await this.prisma.node.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return nodes;
  }

  async getNodeById(userId: string, nodeId: string) {
    const node = await this.prisma.node.findFirst({
      where: {
        id: nodeId,
        userId,
      },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return node;
  }

  async deleteNode(userId: string, nodeId: string) {
    const result = await this.prisma.node.deleteMany({
      where: {
        id: nodeId,
        userId: userId,
      },
    });
    if (result.count === 0) throw new NotFoundException('Node not found');
    return { success: true };
  }
}
