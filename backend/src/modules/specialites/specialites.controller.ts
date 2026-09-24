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
import { SpecialitesService } from './specialites.service';
import { CreateSpecialiteDto } from './dto/create-specialite.dto';
import { UpdateSpecialiteDto } from './dto/update-specialite.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';

@ApiTags('Referentiels - Specialites')
@Controller('specialites')
export class SpecialitesController {
  constructor(private readonly specialitesService: SpecialitesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les specialites' })
  @ApiQuery({ name: 'includeInactive', required: false })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.specialitesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une specialite' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.specialitesService.findByIdOrFail(id);
  }

  @Post()
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Creer une specialite' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateSpecialiteDto) {
    return this.specialitesService.create(dto);
  }

  @Patch(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Modifier une specialite' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSpecialiteDto,
  ) {
    return this.specialitesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver une specialite (soft delete)' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.specialitesService.remove(id);
  }
}