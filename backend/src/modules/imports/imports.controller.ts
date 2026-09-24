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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ImportsService } from './imports.service';
import { ImportExecuteDto } from './dto/import-execute.dto';
import { Roles } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get('template')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Telecharger le modele Excel d import' })
  async downloadTemplate(@Res() res: Response): Promise<void> {
    const buffer = await this.importsService.generateTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="modele-import-personnel.xlsx"',
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Televerser un fichier Excel et previsualiser les lignes' })
  @UseInterceptors(FileInterceptor('file'))
  async preview(
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importsService.preview(file, { user });
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Executer un import previsualise' })
  async execute(
    @Body() dto: ImportExecuteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importsService.execute(dto, { user });
  }

  @Get()
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Historique des imports' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.importsService.findAll(Number(page) || undefined, Number(limit) || undefined);
  }

  @Get(':id')
  @Roles(TypeCompte.ADMIN_SYSTEME, TypeCompte.RH_ETAT_MAJOR, TypeCompte.RH_BASE)
  @ApiOperation({ summary: 'Detail d un import avec ses lignes' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.importsService.findById(id);
  }
}