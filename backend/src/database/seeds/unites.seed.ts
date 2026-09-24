import { DataSource } from 'typeorm';
import { Unite } from '../../modules/unites/entities/unite.entity';
import { Base } from '../../modules/bases/entities/base.entity';

interface UniteSeed {
  baseNom: string;
  nom: string;
  code: string;
}

/**
 * Liste des unites extraite du cahier des charges (section 2.1) et du jeu
 * de donnees (organigramme IREC RANTSANA).
 *
 * Les codes sont generes par normalisation du nom (majuscules, tirets).
 * Ils servent de cle stable pour l'import Excel.
 */
const UNITES: UniteSeed[] = [
  // EMMN - Etat-Major
  { baseNom: 'EMMN', nom: 'Etat-Major', code: 'EMMN-EM' },

  // BANA - Unites navigantes
  { baseNom: 'BANA', nom: 'RC TROZONA', code: 'RC-TROZONA' },
  { baseNom: 'BANA', nom: 'PC TSELATRA', code: 'PC-TSELATRA' },
  { baseNom: 'BANA', nom: 'PC MALAKY', code: 'PC-MALAKY' },
  { baseNom: 'BANA', nom: 'Direction du Port Militaire', code: 'BANA-DPM' },

  // BANA - Unites a terre
  { baseNom: 'BANA', nom: 'Unite Marine', code: 'BANA-UM' },
  { baseNom: 'BANA', nom: 'EREN', code: 'EREN' },
  { baseNom: 'BANA', nom: 'CPS', code: 'CPS' },

  // BANA - Detachements marine
  { baseNom: 'BANA', nom: 'DNMG Majunga', code: 'DNMG' },
  { baseNom: 'BANA', nom: 'DNNB Nosy Be', code: 'DNNB' },
  { baseNom: 'BANA', nom: 'DNSM Sainte-Marie', code: 'DNSM' },
  { baseNom: 'BANA', nom: 'DNTL Toliara', code: 'DNTL' },
  { baseNom: 'BANA', nom: 'DNFD Fort-Dauphin', code: 'DNFD' },
  { baseNom: 'BANA', nom: 'DNMK Manakara', code: 'DNMK' },

  // 2eme BIMA
  { baseNom: '2eme BIMA', nom: 'CCS', code: 'BIMA-CCS' },
  { baseNom: '2eme BIMA', nom: '1er CIMA', code: 'BIMA-1CIMA' },
  { baseNom: '2eme BIMA', nom: '2eme CIMA', code: 'BIMA-2CIMA' },
  { baseNom: '2eme BIMA', nom: '3eme CIMA', code: 'BIMA-3CIMA' },
  { baseNom: '2eme BIMA', nom: 'CCMA', code: 'BIMA-CCMA' },
];

export async function seedUnites(dataSource: DataSource): Promise<void> {
  const uniteRepo = dataSource.getRepository(Unite);
  const baseRepo = dataSource.getRepository(Base);

  for (const item of UNITES) {
    const base = await baseRepo.findOne({ where: { nom: item.baseNom } });
    if (!base) {
      // eslint-disable-next-line no-console
      console.warn(`Base introuvable pour l unite ${item.nom}, ignoree.`);
      continue;
    }

    const existing = await uniteRepo.findOne({ where: { code: item.code } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Unite deja presente : ${item.code}`);
      continue;
    }

    const entity = uniteRepo.create({
      nom: item.nom,
      code: item.code,
      baseId: base.id,
      actif: true,
    });
    await uniteRepo.save(entity);
    // eslint-disable-next-line no-console
    console.log(`Unite creee : ${item.code}`);
  }
}