import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { StatutFinDeLien } from '../personnels/services/personnel-retraite.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Dashboard')
@Controller('dashboard')
@Roles(
  TypeCompte.ADMIN_SYSTEME,
  TypeCompte.RH_ETAT_MAJOR,
  TypeCompte.RH_BASE,
  TypeCompte.CHEF_COMMANDEMENT,
)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Vue globale du tableau de bord' })
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getStats({ user });
  }

  @Get('repartition-base')
  @ApiOperation({ summary: 'Repartition du personnel par base' })
  async getRepartitionBase(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getRepartitionParBase({ user });
  }

  @Get('repartition-unite')
  @ApiOperation({ summary: 'Repartition du personnel par unite' })
  @ApiQuery({ name: 'baseId', required: false })
  async getRepartitionUnite(
    @CurrentUser() user: AuthenticatedUser,
    @Query('baseId') baseId?: string,
  ) {
    return this.dashboardService.getRepartitionParUnite({ user }, baseId);
  }

  @Get('repartition-grade')
  @ApiOperation({ summary: 'Repartition du personnel par categorie de grade' })
  async getRepartitionGrade(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getRepartitionParCategorieGrade({ user });
  }

  @Get('repartition-specialite')
  @ApiOperation({ summary: 'Repartition du personnel par specialite' })
  async getRepartitionSpecialite(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getRepartitionParSpecialite({ user });
  }

  @Get('departs-retraite')
  @ApiOperation({ summary: 'Projection des departs a la retraite par annee' })
  @ApiQuery({ name: 'anneeDebut', required: false, type: Number })
  @ApiQuery({ name: 'anneeFin', required: false, type: Number })
  async getDepartsRetraite(
    @CurrentUser() user: AuthenticatedUser,
    @Query('anneeDebut') anneeDebut?: string,
    @Query('anneeFin') anneeFin?: string,
  ) {
    return this.dashboardService.getDepartsRetraite(
      { user },
      anneeDebut ? parseInt(anneeDebut, 10) : undefined,
      anneeFin ? parseInt(anneeFin, 10) : undefined,
    );
  }

  @Get('fin-de-lien')
  @ApiOperation({ summary: 'Liste du personnel en fin de lien' })
  @ApiQuery({
    name: 'statut',
    required: false,
    enum: StatutFinDeLien,
  })
  async getFinDeLien(
    @CurrentUser() user: AuthenticatedUser,
    @Query('statut') statut?: StatutFinDeLien,
  ) {
    return this.dashboardService.getPersonnelFinDeLien({ user }, statut);
  }
}