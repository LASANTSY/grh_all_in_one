import { DataSource } from 'typeorm';
import { Grade } from '../../modules/grades/entities/grade.entity';
import { GradeCategorie } from '../../modules/grades/enums/grade-categorie.enum';

interface GradeSeed {
  libelle: string;
  categorie: GradeCategorie;
  ageDepartRetraite: number;
  ordre: number;
}

/**
 * Grades de la Marine Nationale (Armee de mer).
 *
 * Source : jeu de donnees fourni (image 3 "Grades et Appellations") et
 * image 1 "Limites d'age des militaires" (officiers).
 *
 * - Les grades des officiers generaux sont rattaches a la categorie
 *   OFFICIER_GENERAL.
 * - Les officiers superieurs et subalternes de la marine sont dans
 *   OFFICIER_MARINE (categorie unique cote application).
 * - Les officiers mariniers (grade SOF superieurs et subalternes) sont dans
 *   OFFICIER_MARINIER.
 * - Les grades du rang (quartiers maitres, matelots) sont dans QMO.
 *
 * Les ages de depart sont ceux de l'image 1 (officiers uniquement dans le
 * jeu de donnees fourni). Pour les non-officiers, le tableau de l'image 1
 * est partiellement vide : les valeurs retenues ci-dessous sont les valeurs
 * applicables a la Marine figurant dans la colonne "Terre, Air, Mer".
 *
 * Ces valeurs sont des donnees de reference : elles doivent etre validees
 * avec le RH avant mise en production.
 */
const GRADES: GradeSeed[] = [
  // --- Officiers generaux (Marine) ---
  { libelle: 'Vice-Amiral d escadre', categorie: GradeCategorie.OFFICIER_GENERAL, ageDepartRetraite: 61, ordre: 1 },
  { libelle: 'Vice-Amiral', categorie: GradeCategorie.OFFICIER_GENERAL, ageDepartRetraite: 61, ordre: 2 },
  { libelle: 'Contre-Amiral', categorie: GradeCategorie.OFFICIER_GENERAL, ageDepartRetraite: 61, ordre: 3 },

  // --- Officiers superieurs (Marine) ---
  { libelle: 'Capitaine de Vaisseau', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 61, ordre: 4 },
  { libelle: 'Capitaine de Fregate', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 58, ordre: 5 },
  { libelle: 'Capitaine de Corvette', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 58, ordre: 6 },

  // --- Officiers subalternes (Marine) ---
  { libelle: 'Lieutenant de Vaisseau', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 58, ordre: 7 },
  { libelle: 'Enseigne de Vaisseau de 1ere Classe', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 55, ordre: 8 },
  { libelle: 'Enseigne de Vaisseau de 2eme Classe', categorie: GradeCategorie.OFFICIER_MARINE, ageDepartRetraite: 55, ordre: 9 },

  // --- Officiers mariniers superieurs ---
  { libelle: 'Maitre Principal', categorie: GradeCategorie.OFFICIER_MARINIER, ageDepartRetraite: 55, ordre: 10 },
  { libelle: 'Premier Maitre', categorie: GradeCategorie.OFFICIER_MARINIER, ageDepartRetraite: 55, ordre: 11 },
  { libelle: 'Maitre', categorie: GradeCategorie.OFFICIER_MARINIER, ageDepartRetraite: 55, ordre: 12 },

  // --- Officiers mariniers subalternes ---
  { libelle: 'Second Maitre de 1ere Classe', categorie: GradeCategorie.OFFICIER_MARINIER, ageDepartRetraite: 52, ordre: 13 },
  { libelle: 'Second Maitre de 2eme Classe', categorie: GradeCategorie.OFFICIER_MARINIER, ageDepartRetraite: 52, ordre: 14 },

  // --- Quartiers maitres (militaires du rang) ---
  { libelle: 'Quartier Maitre de 1ere Classe', categorie: GradeCategorie.QMO, ageDepartRetraite: 45, ordre: 15 },
  { libelle: 'Quartier Maitre de 2eme Classe', categorie: GradeCategorie.QMO, ageDepartRetraite: 45, ordre: 16 },

  // --- Matelots ---
  { libelle: 'Matelot de 1ere Classe', categorie: GradeCategorie.QMO, ageDepartRetraite: 45, ordre: 17 },
  { libelle: 'Matelot de 2eme Classe', categorie: GradeCategorie.QMO, ageDepartRetraite: 45, ordre: 18 },
];

export async function seedGrades(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Grade);

  for (const item of GRADES) {
    const existing = await repository.findOne({ where: { libelle: item.libelle } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Grade deja present : ${item.libelle}`);
      continue;
    }
    const entity = repository.create({ ...item, actif: true });
    await repository.save(entity);
    // eslint-disable-next-line no-console
    console.log(`Grade cree : ${item.libelle}`);
  }
}