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
import { BasesService } from './bases.service';
import { CreateBaseDto } from './dto/create-base.dto';
import { UpdateBaseDto } from './dto/update-base.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';

@ApiTags('Referentiels - Bases')
@Controller('bases')
export class BasesController {
  constructor(private readonly basesService: BasesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les bases' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.basesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une base' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.basesService.findByIdOrFail(id);
  }

  @Post()
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Creer une base' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateBaseDto) {
    return this.basesService.create(dto);
  }

  @Patch(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @ApiOperation({ summary: 'Modifier une base' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBaseDto,
  ) {
    return this.basesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver une base (soft delete)' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.basesService.remove(id);
  }
}