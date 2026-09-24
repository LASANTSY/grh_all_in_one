import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ExcelParserService } from './services/excel-parser.service';
import { ExcelValidatorService } from './services/excel-validator.service';
import { ExcelImporterService } from './services/excel-importer.service';
import { ExcelTemplateService } from './services/excel-template.service';

import { ImportPersonnel } from './entities/import-personnel.entity';
import { LigneImport } from './entities/ligne-import.entity';
import { Personnel } from '../personnels/entities/personnel.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Unite } from '../unites/entities/unite.entity';
import { Specialite } from '../specialites/entities/specialite.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ImportPersonnel,
      LigneImport,
      Personnel,
      Grade,
      Unite,
      Specialite,
    ]),
  ],
  controllers: [ImportsController],
  providers: [
    ImportsService,
    ExcelParserService,
    ExcelValidatorService,
    ExcelImporterService,
    ExcelTemplateService,
  ],
  exports: [ImportsService],
})
export class ImportsModule {}