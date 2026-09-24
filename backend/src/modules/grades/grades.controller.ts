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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { GradeCategorie } from './enums/grade-categorie.enum';

@ApiTags('Referentiels - Grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les grades' })
  @ApiQuery({ name: 'categorie', required: false, enum: GradeCategorie })
  @ApiQuery({ name: 'includeInactive', required: false })
  async findAll(
    @Query('categorie') categorie?: GradeCategorie,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.gradesService.findAll({
      categorie,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un grade' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.gradesService.findByIdOrFail(id);
  }

  @Post()
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Creer un grade' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }

  @Patch(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Modifier un grade' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.gradesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver un grade (soft delete)' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gradesService.remove(id);
  }
}