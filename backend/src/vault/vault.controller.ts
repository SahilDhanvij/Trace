import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { VaultService } from './vault.service';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get(':nodeId')
  getVaultEntries(@Req() req, @Param('nodeId') nodeId: string) {
    return this.vaultService.getVaultEntries(req.user.userId, nodeId);
  }

  @Post(':nodeId')
  createVaultEntry(
    @Req() req,
    @Param('nodeId') nodeId: string,
    @Body()
    body: { caption?: string; photoBase64?: string; visitedAt?: string },
  ) {
    return this.vaultService.createVaultEntry(req.user.userId, nodeId, body);
  }

  @Patch('entry/:entryId')
  updateVaultEntry(
    @Req() req,
    @Param('entryId') entryId: string,
    @Body() body: { caption?: string; visitedAt?: string },
  ) {
    return this.vaultService.updateVaultEntry(req.user.userId, entryId, body);
  }

  @Delete('entry/:entryId')
  deleteVaultEntry(@Req() req, @Param('entryId') entryId: string) {
    return this.vaultService.deleteVaultEntry(req.user.userId, entryId);
  }
}
