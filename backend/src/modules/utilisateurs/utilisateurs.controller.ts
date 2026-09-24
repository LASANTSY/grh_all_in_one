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
import { UtilisateursService } from './utilisateurs.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ForbiddenException } from '@nestjs/common'

@ApiTags('Utilisateurs')
@Controller('utilisateurs')
@Roles(TypeCompte.ADMIN_SYSTEME)
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les comptes utilisateurs' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('typeCompte') typeCompte?: TypeCompte,
  ) {
    const result = await this.utilisateursService.findAll(
      Number(page) || undefined,
      Number(limit) || undefined,
      typeCompte,
    );

    return {
      ...result,
      data: result.data.map((c) => this.sanitize(c)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un compte utilisateur' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const compte = await this.utilisateursService.findByIdOrFail(id);
    return this.sanitize(compte);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un compte utilisateur' })
  @ApiResponse({ status: 201, description: 'Compte cree avec mot de passe provisoire' })
  async create(@Body() dto: CreateUtilisateurDto) {
    const { compte, motDePasseProvisoire } = await this.utilisateursService.create(dto);
    return {
      compte: this.sanitize(compte),
      motDePasseProvisoire,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un compte utilisateur' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUtilisateurDto,
  ) {
    const compte = await this.utilisateursService.update(id, dto);
    return this.sanitize(compte);
  }

  @Post(':id/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deverrouiller un compte utilisateur' })
  async unlock(@Param('id', new ParseUUIDPipe()) id: string) {
    const compte = await this.utilisateursService.unlock(id);
    return this.sanitize(compte);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reinitialiser le mot de passe d un compte' })
  async resetPassword(@Param('id', new ParseUUIDPipe()) id: string) {
    const { compte, motDePasseProvisoire } = await this.utilisateursService.resetPassword(id);
    return {
      compte: this.sanitize(compte),
      motDePasseProvisoire,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver un compte utilisateur (soft delete)' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    if (currentUser.compteId === id) {
  throw new ForbiddenException({
    code: 'UTILISATEUR_SELF_DISABLE_FORBIDDEN',
    message: 'Un administrateur ne peut pas desactiver son propre compte.',
  });
}
    await this.utilisateursService.update(id, { actif: false });
  }

  private sanitize(compte: {
    id: string;
    identifiant: string;
    typeCompte: TypeCompte;
    personnelId: string | null;
    unitePerimetreId: string | null;
    compteVerrouille: boolean;
    tentativesEchouees: number;
    dernierEchec: Date | null;
    doitChangerMotDePasse: boolean;
    dateDerniereConnexion: Date | null;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: compte.id,
      identifiant: compte.identifiant,
      typeCompte: compte.typeCompte,
      personnelId: compte.personnelId,
      unitePerimetreId: compte.unitePerimetreId,
      compteVerrouille: compte.compteVerrouille,
      tentativesEchouees: compte.tentativesEchouees,
      dernierEchec: compte.dernierEchec,
      doitChangerMotDePasse: compte.doitChangerMotDePasse,
      dateDerniereConnexion: compte.dateDerniereConnexion,
      actif: compte.actif,
      createdAt: compte.createdAt,
      updatedAt: compte.updatedAt,
    };
  }
}