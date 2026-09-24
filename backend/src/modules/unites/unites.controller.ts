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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnitesService } from './unites.service';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';

@ApiTags('Referentiels - Unites')
@Controller('unites')
export class UnitesController {
  constructor(private readonly unitesService: UnitesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les unites' })
  @ApiQuery({ name: 'baseId', required: false, description: 'Filtrer par base' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Inclure les unites inactives' })
  async findAll(
    @Query('baseId') baseId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.unitesService.findAll({
      baseId,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une unite' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.unitesService.findByIdOrFail(id);
  }

  @Post()
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Creer une unite' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateUniteDto) {
    return this.unitesService.create(dto);
  }

  @Patch(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Modifier une unite' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUniteDto,
  ) {
    return this.unitesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver une unite (soft delete)' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.unitesService.remove(id);
  }
}