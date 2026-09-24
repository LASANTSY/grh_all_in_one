import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ImportPersonnel, StatutImport } from '../entities/import-personnel.entity';
import {
  LigneImport,
  StatutLigneImport,
  ActionLigneImport,
} from '../entities/ligne-import.entity';
import { Personnel } from '../../personnels/entities/personnel.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Unite } from '../../unites/entities/unite.entity';
import { Specialite } from '../../specialites/entities/specialite.entity';

import { ValidatedLigne } from './excel-validator.service';
import { ActionImport } from '../dto/import-execute.dto';

export interface ExecuteImportInput {
  importId: string;
  lignes: ValidatedLigne[];
  decisions: Map<number, ActionImport>;
}

export interface ExecuteImportResult {
  lignesCreees: number;
  lignesMisesAJour: number;
  lignesErreur: number;
  erreurs: Array<{ numeroLigne: number; message: string }>;
}

@Injectable()
export class ExcelImporterService {
  private readonly logger = new Logger(ExcelImporterService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Unite)
    private readonly uniteRepository: Repository<Unite>,
    @InjectRepository(Specialite)
    private readonly specialiteRepository: Repository<Specialite>,
  ) {}

  async execute(input: ExecuteImportInput): Promise<ExecuteImportResult> {
    const grades = await this.gradeRepository.find();
    const unites = await this.uniteRepository.find();
    const specialites = await this.specialiteRepository.find();

    const gradeMap = new Map(grades.map((g) => [g.libelle.toLowerCase(), g]));
    const uniteMap = new Map(unites.map((u) => [u.code.toLowerCase(), u]));
    const specialiteMap = new Map(specialites.map((s) => [s.libelle.toLowerCase(), s]));

    const result: ExecuteImportResult = {
      lignesCreees: 0,
      lignesMisesAJour: 0,
      lignesErreur: 0,
      erreurs: [],
    };

    // Les lignes en erreur de validation sont persistees telles quelles
    const lignesAExecuter = input.lignes.filter((l) => l.valide);

    for (const ligne of input.lignes.filter((l) => !l.valide)) {
      await this.saveLigne(
        input.importId,
        ligne.numeroLigne,
        StatutLigneImport.ERREUR,
        null,
        ligne.erreurs.map((e) => `${e.champ}: ${e.message}`).join('; '),
        null,
        ligne.valeurs,
      );
      result.lignesErreur += 1;
    }

    for (const ligne of lignesAExecuter) {
      const decision = this.resolveAction(ligne, input.decisions);

      if (decision === 'IGNOREE') {
        await this.saveLigne(
          input.importId,
          ligne.numeroLigne,
          StatutLigneImport.IGNOREE,
          ActionLigneImport.IGNOREE,
          null,
          ligne.personnelExistantId,
          ligne.valeurs,
        );
        continue;
      }

      try {
        const personnelId = await this.dataSource.transaction(async (manager) => {
          const grade = gradeMap.get(ligne.valeurs.gradeLibelle!.toLowerCase())!;
          const unite = uniteMap.get(ligne.valeurs.uniteCode!.toLowerCase())!;
          const specialite = ligne.valeurs.specialiteLibelle
            ? specialiteMap.get(ligne.valeurs.specialiteLibelle.toLowerCase()) ?? null
            : null;

          const fields = this.mapFields(ligne.valeurs, grade.id, unite.id, specialite?.id ?? null);

          if (decision === 'CREATION') {
            const entity = manager.create(Personnel, { ...fields, actif: true });
            const saved = await manager.save(Personnel, entity);
            return saved.id;
          }

          // MISE_A_JOUR
          const existing = await manager.findOne(Personnel, {
            where: { id: ligne.personnelExistantId! },
          });
          if (!existing) {
            throw new Error('Personnel introuvable pour mise a jour.');
          }
          Object.assign(existing, fields);
          const saved = await manager.save(Personnel, existing);
          return saved.id;
        });

        const action = decision === 'CREATION' ? ActionLigneImport.CREATION : ActionLigneImport.MISE_A_JOUR;
        await this.saveLigne(
          input.importId,
          ligne.numeroLigne,
          StatutLigneImport.VALIDE,
          action,
          null,
          personnelId,
          ligne.valeurs,
        );

        if (decision === 'CREATION') result.lignesCreees += 1;
        else result.lignesMisesAJour += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        this.logger.error(`Echec import ligne ${ligne.numeroLigne}: ${message}`);
        await this.saveLigne(
          input.importId,
          ligne.numeroLigne,
          StatutLigneImport.ERREUR,
          null,
          message,
          null,
          ligne.valeurs,
        );
        result.lignesErreur += 1;
        result.erreurs.push({ numeroLigne: ligne.numeroLigne, message });
      }
    }

    await this.dataSource.getRepository(ImportPersonnel).update(input.importId, {
      statut: StatutImport.TERMINE,
      lignesCreees: result.lignesCreees,
      lignesMisesAJour: result.lignesMisesAJour,
      lignesErreur: result.lignesErreur,
    });

    return result;
  }

  private resolveAction(ligne: ValidatedLigne, decisions: Map<number, ActionImport>): ActionImport {
    if (!ligne.personnelExistantId) return 'CREATION';
    return decisions.get(ligne.numeroLigne) ?? 'IGNOREE';
  }

  private async saveLigne(
    importId: string,
    numeroLigne: number,
    statut: StatutLigneImport,
    action: ActionLigneImport | null,
    messageErreur: string | null,
    personnelId: string | null,
    donneesBrutes: Record<string, string | null>,
  ): Promise<void> {
    const ligne = this.dataSource.getRepository(LigneImport).create({
      importId,
      numeroLigne,
      statut,
      actionAppliquee: action,
      messageErreur,
      personnelId,
      donneesBrutes,
    });
    await this.dataSource.getRepository(LigneImport).save(ligne);
  }

  private mapFields(
    valeurs: Record<string, string | null>,
    gradeId: string,
    uniteId: string,
    specialiteId: string | null,
  ): Partial<Personnel> {
    const toDate = (v: string | null | undefined): Date | null =>
      v && v.trim().length > 0 ? new Date(v) : null;

    const str = (v: string | null | undefined): string | null =>
      v && v.trim().length > 0 ? v.trim() : null;

    return {
      matriculeRecrutement: valeurs.matriculeRecrutement!.trim(),
      matriculeFinancier: str(valeurs.matriculeFinancier),
      nom: valeurs.nom!.trim(),
      prenoms: valeurs.prenoms!.trim(),
      dateNaissance: new Date(valeurs.dateNaissance!),
      lieuNaissance: valeurs.lieuNaissance!.trim(),
      email: str(valeurs.email),
      telephoneMobile: str(valeurs.telephoneMobile),
      numeroCIN: str(valeurs.numeroCIN),
      dateDelivranceCIN: toDate(valeurs.dateDelivranceCIN),
      lieuDelivranceCIN: str(valeurs.lieuDelivranceCIN),
      dateDuplicataCIN: toDate(valeurs.dateDuplicataCIN),
      numeroPasseport: str(valeurs.numeroPasseport),
      dateDelivrancePasseport: toDate(valeurs.dateDelivrancePasseport),
      corps: str(valeurs.corps),
      lieuEmploi: str(valeurs.lieuEmploi),
      fonctionActuelle: str(valeurs.fonctionActuelle),
      situationMilitaire: str(valeurs.situationMilitaire),
      dateEntreeService: toDate(valeurs.dateEntreeService),
      dateLiberationServiceNational: toDate(valeurs.dateLiberationServiceNational),
      datePremierRengagement: toDate(valeurs.datePremierRengagement),
      niveauInstruction: str(valeurs.niveauInstruction),
      gradeId,
      uniteId,
      specialiteId,
    };
  }
}