import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuditService } from './audit.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';

@ApiTags('Audit')
@Controller('audit')
@Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Consulter le journal d audit' })
  async findAll(@Query() filters: AuditFiltersDto) {
    return this.auditService.findAll(
      {
        action: filters.action,
        entiteType: filters.entiteType,
        entiteId: filters.entiteId,
        personnelId: filters.personnelId,
        auteurId: filters.auteurId,
        dateDebut: filters.dateDebut ? new Date(filters.dateDebut) : undefined,
        dateFin: filters.dateFin ? new Date(filters.dateFin) : undefined,
      },
      filters.page,
      filters.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une entree d audit' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const entry = await this.auditService.findById(id);
    if (!entry) {
      throw new NotFoundException({
        code: 'AUDIT_NOT_FOUND',
        message: 'Entree d audit introuvable.',
      });
    }
    return entry;
  }
}