import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { DemandesService } from './demandes.service';
import { CreateDemandeModificationDto } from './dto/create-demande.dto';
import { RejectDemandeDto } from './dto/reject-demande.dto';
import { StatutDemande } from './entities/demande-modification.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Demandes de modification')
@Controller('demandes-modification')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Post()
  @ApiOperation({ summary: 'Creer une demande de modification (agent)' })
  async create(
    @Body() dto: CreateDemandeModificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.demandesService.create(dto, { user });
  }

  @Get()
  @ApiOperation({ summary: 'Lister les demandes accessibles' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutDemande })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('statut') statut?: StatutDemande,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.demandesService.findAll(
      { user },
      statut,
      Number(page) || undefined,
      Number(limit) || undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une demande' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.demandesService.findById(id, { user });
  }

  @Post(':id/valider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider une demande (RH)' })
  async valider(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.demandesService.valider(id, { user });
  }

  @Post(':id/rejeter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeter une demande (RH)' })
  async rejeter(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RejectDemandeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.demandesService.rejeter(id, dto, { user });
  }
}