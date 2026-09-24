import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { EntreeAudit } from './entities/entree-audit.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EntreeAudit])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}