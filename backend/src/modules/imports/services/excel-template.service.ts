import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IMPORT_REQUIRED_COLUMNS } from './excel-parser.service';

/**
 * Colonnes du modele officiel : obligatoires puis optionnelles.
 * Les colonnes optionnelles sont un choix d'implementation a valider avec le RH.
 */
const OPTIONAL_COLUMNS = [
  'matriculeFinancier',
  'email',
  'telephoneMobile',
  'numeroCIN',
  'dateDelivranceCIN',
  'lieuDelivranceCIN',
  'dateEntreeService',
  'corps',
  'lieuEmploi',
  'fonctionActuelle',
  'specialiteLibelle',
  'situationMilitaire',
  'niveauInstruction',
] as const;

const SAMPLE_ROW: Record<string, string> = {
  matriculeRecrutement: 'MAT-2020-00001',
  nom: 'RAKOTO',
  prenoms: 'Jean Claude',
  dateNaissance: '1985-06-15',
  lieuNaissance: 'Antananarivo',
  gradeLibelle: 'Capitaine de Corvette',
  uniteCode: 'RC-TROZONA',
  matriculeFinancier: 'FIN-2020-00001',
  email: 'jean.rakoto@example.mg',
  telephoneMobile: '+261 34 12 345 67',
  numeroCIN: '101234567890',
  dateDelivranceCIN: '2010-03-12',
  lieuDelivranceCIN: 'Antananarivo',
  dateEntreeService: '2005-09-01',
  corps: 'Marine',
  lieuEmploi: 'Antsiranana',
  fonctionActuelle: 'Commandant en second',
  specialiteLibelle: 'Mecanicien naval',
  situationMilitaire: 'Officier de carriere',
  niveauInstruction: 'Bac +5',
};

@Injectable()
export class ExcelTemplateService {
  async generate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GRH EMMN';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Personnel');

    const allColumns = [...IMPORT_REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

    sheet.columns = allColumns.map((key) => ({
      header: key,
      key,
      width: Math.max(key.length + 2, 18),
    }));

    // Ligne d'exemple
    const sampleValues: Record<string, string> = {};
    for (const col of allColumns) {
      sampleValues[col] = SAMPLE_ROW[col] ?? '';
    }
    sheet.addRow(sampleValues);

    // Style de l'en-tete : gras + fond
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Colonnes obligatoires : fond jaune pale pour les distinguer
    headerRow.eachCell((cell, colNumber) => {
      const key = allColumns[colNumber - 1];
      if ((IMPORT_REQUIRED_COLUMNS as readonly string[]).includes(key)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' },
        };
      }
    });

    // Feuille "Notice"
    const notice = workbook.addWorksheet('Notice');
    notice.columns = [{ width: 100 }];
    notice.addRow(['Notice d utilisation du modele d import']);
    notice.addRow(['']);
    notice.addRow([
      '1. La premiere ligne doit contenir les en-tetes exacts, sans modification.',
    ]);
    notice.addRow([
      '2. Les colonnes obligatoires sont surlignees en jaune pale.',
    ]);
    notice.addRow([
      '3. Ne pas supprimer de colonnes. Des colonnes supplementaires seront ignorees.',
    ]);
    notice.addRow([
      '4. Formats de date attendus : AAAA-MM-JJ (exemple : 1985-06-15).',
    ]);
    notice.addRow([
      '5. Les grades et les unites sont identifies par leur libelle/code exact.',
    ]);
    notice.addRow([
      '6. Supprimer la ligne d exemple avant l import.',
    ]);
    notice.getRow(1).font = { bold: true, size: 14 };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}