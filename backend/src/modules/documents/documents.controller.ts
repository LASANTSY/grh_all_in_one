import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Documents')
@Controller('personnels/:personnelId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les pieces jointes d un personnel' })
  async list(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentsService.listForPersonnel(personnelId, { user });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une piece jointe et ses versions' })
  async detail(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentsService.getDetail(personnelId, id, { user });
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Televerser une nouvelle piece jointe' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentsService.upload(personnelId, dto, file, { user });
  }

  @Post(':id/versions')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Ajouter une nouvelle version a une piece jointe' })
  @UseInterceptors(FileInterceptor('file'))
  async addVersion(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentsService.addVersion(personnelId, id, file, { user });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Telecharger la version courante d une piece jointe' })
  async download(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, nomOriginal, format } = await this.documentsService.download(
      personnelId,
      id,
      { user },
    );

    res.setHeader('Content-Type', format);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(nomOriginal)}"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactiver une piece jointe (soft delete)' })
  async remove(
    @Param('personnelId', new ParseUUIDPipe()) personnelId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.documentsService.remove(personnelId, id, { user });
  }
}