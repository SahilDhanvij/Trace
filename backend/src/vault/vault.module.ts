import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [VaultController],
  providers: [VaultService, PrismaService]
})
export class VaultModule {}
