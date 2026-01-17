import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NodesModule } from './nodes/nodes.module';
import { EdgesModule } from './edges/edges.module';
import { VaultModule } from './vault/vault.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UserModule, NodesModule, EdgesModule, VaultModule, IntegrationsModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
