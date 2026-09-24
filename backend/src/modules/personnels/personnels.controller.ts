import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PersonnelsService } from './personnels.service';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { SearchPersonnelDto } from './dto/search-personnel.dto';

import { CreateEnfantDto } from './dto/enfant/create-enfant.dto';
import { UpdateEnfantDto } from './dto/enfant/update-enfant.dto';
import { CreateHistoriqueGradeDto } from './dto/historique-grade/create-historique-grade.dto';
import { UpdateHistoriqueGradeDto } from './dto/historique-grade/update-historique-grade.dto';
import { CreateAffectationDto } from './dto/affectation/create-affectation.dto';
import { UpdateAffectationDto } from './dto/affectation/update-affectation.dto';
import { CreateDecorationDto } from './dto/decoration/create-decoration.dto';
import { UpdateDecorationDto } from './dto/decoration/update-decoration.dto';
import { CreateCursusScolaireDto } from './dto/cursus-scolaire/create-cursus-scolaire.dto';
import { UpdateCursusScolaireDto } from './dto/cursus-scolaire/update-cursus-scolaire.dto';
import { CreateStageMilitaireDto } from './dto/stage-militaire/create-stage-militaire.dto';
import { UpdateStageMilitaireDto } from './dto/stage-militaire/update-stage-militaire.dto';
import { CreateCompetenceLinguistiqueDto } from './dto/competence-linguistique/create-competence-linguistique.dto';
import { UpdateCompetenceLinguistiqueDto } from './dto/competence-linguistique/update-competence-linguistique.dto';

import { Roles } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Personnels')
@Controller('personnels')
export class PersonnelsController {
  constructor(private readonly personnelsService: PersonnelsService) {}

  // ============================================================
  // RECHERCHE ET LECTURE
  // ============================================================

  @Get()
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  @ApiOperation({ summary: 'Rechercher et lister le personnel' })
  async search(
    @Query() dto: SearchPersonnelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personnelsService.search(dto, { user });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter la fiche complete d un personnel' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personnelsService.findById(id, { user });
  }

  @Get(':id/fin-de-lien')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  @ApiOperation({ summary: 'Calculer la fin de lien d un personnel' })
  async computeFinDeLien(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.computeFinDeLien(id);
  }

  // ============================================================
  // CRUD PRINCIPAL
  // ============================================================

  @Post()
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Creer une fiche personnel' })
  @ApiResponse({ status: 201 })
  async create(
    @Body() dto: CreatePersonnelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personnelsService.create(dto, { user });
  }

  @Patch(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Modifier une fiche personnel' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePersonnelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personnelsService.update(id, dto, { user });
  }

  @Delete(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver une fiche personnel (soft delete)' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.personnelsService.remove(id, { user });
  }

  // ============================================================
  // ENFANTS
  // ============================================================

  @Get(':id/enfants')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listEnfants(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listEnfants(id);
  }

  @Post(':id/enfants')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addEnfant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateEnfantDto,
  ) {
    return this.personnelsService.addEnfant(id, dto);
  }

  @Patch(':id/enfants/:enfantId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateEnfant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('enfantId', new ParseUUIDPipe()) enfantId: string,
    @Body() dto: UpdateEnfantDto,
  ) {
    return this.personnelsService.updateEnfant(id, enfantId, dto);
  }

  @Delete(':id/enfants/:enfantId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEnfant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('enfantId', new ParseUUIDPipe()) enfantId: string,
  ): Promise<void> {
    await this.personnelsService.removeEnfant(id, enfantId);
  }

  // ============================================================
  // HISTORIQUE DES GRADES
  // ============================================================

  @Get(':id/historique-grades')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listHistoriqueGrades(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listHistoriqueGrades(id);
  }

  @Post(':id/historique-grades')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addHistoriqueGrade(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateHistoriqueGradeDto,
  ) {
    return this.personnelsService.addHistoriqueGrade(id, dto);
  }

  @Patch(':id/historique-grades/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateHistoriqueGrade(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateHistoriqueGradeDto,
  ) {
    return this.personnelsService.updateHistoriqueGrade(id, itemId, dto);
  }

  @Delete(':id/historique-grades/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeHistoriqueGrade(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeHistoriqueGrade(id, itemId);
  }

  // ============================================================
  // AFFECTATIONS
  // ============================================================

  @Get(':id/affectations')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listAffectations(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listAffectations(id);
  }

  @Post(':id/affectations')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addAffectation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateAffectationDto,
  ) {
    return this.personnelsService.addAffectation(id, dto);
  }

  @Patch(':id/affectations/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateAffectation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateAffectationDto,
  ) {
    return this.personnelsService.updateAffectation(id, itemId, dto);
  }

  @Delete(':id/affectations/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAffectation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeAffectation(id, itemId);
  }

  // ============================================================
  // DECORATIONS
  // ============================================================

  @Get(':id/decorations')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listDecorations(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listDecorations(id);
  }

  @Post(':id/decorations')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addDecoration(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateDecorationDto,
  ) {
    return this.personnelsService.addDecoration(id, dto);
  }

  @Patch(':id/decorations/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateDecoration(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateDecorationDto,
  ) {
    return this.personnelsService.updateDecoration(id, itemId, dto);
  }

  @Delete(':id/decorations/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDecoration(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeDecoration(id, itemId);
  }

  // ============================================================
  // CURSUS SCOLAIRE
  // ============================================================

  @Get(':id/cursus-scolaire')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listCursusScolaire(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listCursusScolaire(id);
  }

  @Post(':id/cursus-scolaire')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addCursusScolaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateCursusScolaireDto,
  ) {
    return this.personnelsService.addCursusScolaire(id, dto);
  }

  @Patch(':id/cursus-scolaire/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateCursusScolaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateCursusScolaireDto,
  ) {
    return this.personnelsService.updateCursusScolaire(id, itemId, dto);
  }

  @Delete(':id/cursus-scolaire/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCursusScolaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeCursusScolaire(id, itemId);
  }

  // ============================================================
  // STAGES MILITAIRES
  // ============================================================

  @Get(':id/stages-militaires')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listStagesMilitaires(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listStagesMilitaires(id);
  }

  @Post(':id/stages-militaires')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addStageMilitaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateStageMilitaireDto,
  ) {
    return this.personnelsService.addStageMilitaire(id, dto);
  }

  @Patch(':id/stages-militaires/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateStageMilitaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateStageMilitaireDto,
  ) {
    return this.personnelsService.updateStageMilitaire(id, itemId, dto);
  }

  @Delete(':id/stages-militaires/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStageMilitaire(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeStageMilitaire(id, itemId);
  }

  // ============================================================
  // COMPETENCES LINGUISTIQUES
  // ============================================================

  @Get(':id/competences-linguistiques')
  @Roles(
    TypeCompte.ADMIN_SYSTEME,
    TypeCompte.RH_ETAT_MAJOR,
    TypeCompte.RH_BASE,
    TypeCompte.CHEF_COMMANDEMENT,
  )
  async listCompetencesLinguistiques(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.personnelsService.listCompetencesLinguistiques(id);
  }

  @Post(':id/competences-linguistiques')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async addCompetenceLinguistique(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateCompetenceLinguistiqueDto,
  ) {
    return this.personnelsService.addCompetenceLinguistique(id, dto);
  }

  @Patch(':id/competences-linguistiques/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  async updateCompetenceLinguistique(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateCompetenceLinguistiqueDto,
  ) {
    return this.personnelsService.updateCompetenceLinguistique(id, itemId, dto);
  }

  @Delete(':id/competences-linguistiques/:itemId')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCompetenceLinguistique(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    await this.personnelsService.removeCompetenceLinguistique(id, itemId);
  }
}