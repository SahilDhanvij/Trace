import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class VaultService {
  constructor(private readonly prisma: PrismaService) {}

  async getVaultEntries(userId: string, nodeId: string) {
    const node = await this.prisma.node.findFirst({
      where: { id: nodeId, userId },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return this.prisma.vaultEntry.findMany({
      where: { nodeId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVaultEntry(
    userId: string,
    nodeId: string,
    data: { caption?: string; photoBase64?: string; visitedAt?: string },
  ) {
    const node = await this.prisma.node.findFirst({
      where: { id: nodeId, userId },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return this.prisma.vaultEntry.create({
      data: {
        nodeId,
        userId,
        caption: data.caption ?? null,
        photoUrl: data.photoBase64 ?? null,
        visitedAt: data.visitedAt ? new Date(data.visitedAt) : null,
      },
    });
  }

  async updateVaultEntry(
    userId: string,
    entryId: string,
    data: { caption?: string; visitedAt?: string },
  ) {
    const entry = await this.prisma.vaultEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) {
      throw new NotFoundException('Vault entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.vaultEntry.update({
      where: { id: entryId },
      data: {
        caption: data.caption,
        visitedAt: data.visitedAt ? new Date(data.visitedAt) : undefined,
      },
    });
  }

  async deleteVaultEntry(userId: string, entryId: string) {
    const entry = await this.prisma.vaultEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) {
      throw new NotFoundException('Vault entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException();
    }
    await this.prisma.vaultEntry.delete({
      where: { id: entryId },
    });
    return { success: true };
  }
}
