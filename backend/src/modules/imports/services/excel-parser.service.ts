import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';

/**
 * Representation brute d'une ligne lue depuis un fichier Excel d'import.
 * Aucune validation metier n'est faite ici : uniquement de la lecture et
 * de la normalisation (trim, conversion en string, dates ISO).
 */
export interface RawExcelLigne {
  numeroLigne: number;
  valeurs: Record<string, string | null>;
}

export interface ParsedExcel {
  colonnes: string[];
  lignes: RawExcelLigne[];
}

/**
 * Colonnes obligatoires attendues dans le fichier d'import.
 * L'ordre n'a pas d'importance : la correspondance se fait par en-tete.
 */
export const IMPORT_REQUIRED_COLUMNS = [
  'matriculeRecrutement',
  'nom',
  'prenoms',
  'dateNaissance',
  'lieuNaissance',
  'gradeLibelle',
  'uniteCode',
] as const;

@Injectable()
export class ExcelParserService {
  private readonly logger = new Logger(ExcelParserService.name);

  constructor(private readonly configService: ConfigService) {}

  async parse(buffer: Buffer): Promise<ParsedExcel> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    } catch {
      throw new BadRequestException({
        code: 'IMPORT_INVALID_FILE',
        message: 'Le fichier fourni n est pas un fichier Excel valide (.xlsx).',
      });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException({
        code: 'IMPORT_EMPTY_WORKBOOK',
        message: 'Le fichier Excel ne contient aucune feuille.',
      });
    }

    const headerRow = worksheet.getRow(1);
    const colonnes = this.extractHeaders(headerRow);

    if (colonnes.length === 0) {
      throw new BadRequestException({
        code: 'IMPORT_EMPTY_HEADER',
        message: 'La premiere ligne du fichier doit contenir les en-tetes de colonnes.',
      });
    }

    const maxRows = this.configService.get<number>('storage.import.maxRows', 2000);
    const lignes: RawExcelLigne[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // en-tete

      const numLigne = rowNumber - 1;
      const valeurs: Record<string, string | null> = {};
      let hasAnyValue = false;

      colonnes.forEach((col, index) => {
        const cell = row.getCell(index + 1);
        const value = this.readCell(cell);
        valeurs[col] = value;
        if (value !== null && value !== '') hasAnyValue = true;
      });

      if (hasAnyValue) {
        lignes.push({ numeroLigne: numLigne, valeurs });
      }
    });

    if (lignes.length === 0) {
      throw new BadRequestException({
        code: 'IMPORT_EMPTY',
        message: 'Le fichier ne contient aucune ligne de donnees.',
      });
    }

    if (lignes.length > maxRows) {
      throw new BadRequestException({
        code: 'IMPORT_TOO_MANY_ROWS',
        message: `Le fichier contient ${lignes.length} lignes, la limite est de ${maxRows}.`,
      });
    }

    this.logger.log(`Fichier Excel lu : ${lignes.length} lignes, ${colonnes.length} colonnes`);
    return { colonnes, lignes };
  }

  private extractHeaders(headerRow: ExcelJS.Row): string[] {
    const colonnes: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;
      if (value === null || value === undefined) return;
      const text = String(value).trim();
      if (text.length > 0) colonnes.push(text);
    });
    return colonnes;
  }

  private readCell(cell: ExcelJS.Cell): string | null {
    const value = cell.value;

    if (value === null || value === undefined) return null;

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'object' && 'result' in value) {
      const result = (value as ExcelJS.CellFormulaValue).result;
      if (result === null || result === undefined) return null;
      return String(result).trim();
    }

    if (typeof value === 'object' && 'richText' in value) {
      const rich = (value as ExcelJS.CellRichTextValue).richText;
      return rich.map((r) => r.text).join('').trim();
    }

    if (typeof value === 'object' && 'text' in value) {
      return String((value as ExcelJS.CellHyperlinkValue).text).trim();
    }

    const str = String(value).trim();
    return str.length > 0 ? str : null;
  }
}