import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { CompteUtilisateur } from '../../modules/utilisateurs/entities/compte-utilisateur.entity';
import { Base } from '../../modules/bases/entities/base.entity';
import { Unite } from '../../modules/unites/entities/unite.entity';
import { TypeCompte } from '../../common/enums/type-compte.enum';

interface CompteSeed {
  identifiant: string;
  motDePasse: string;
  typeCompte: TypeCompte;
  unitePerimetreCode?: string;
  doitChangerMotDePasse: boolean;
}

/**
 * Comptes de demonstration uniquement.
 *
 * Les identifiants et mots de passe ci-dessous sont PUBLICS (destines au
 * developpement et a la demonstration). Ils ne doivent JAMAIS etre utilises
 * en production.
 *
 * En production, ces comptes doivent etre crees/modifies via l'API
 * d'administration avec des mots de passe robustes et un changement
 * obligatoire a la premiere connexion.
 */
const COMPTES: CompteSeed[] = [
  {
    identifiant: 'admin',
    motDePasse: 'Admin@2024!',
    typeCompte: TypeCompte.ADMIN_SYSTEME,
    doitChangerMotDePasse: true,
  },
  {
    identifiant: 'rh.emmn',
    motDePasse: 'RhEmmn@2024!',
    typeCompte: TypeCompte.RH_ETAT_MAJOR,
    doitChangerMotDePasse: true,
  },
  {
    identifiant: 'rh.bana',
    motDePasse: 'RhBana@2024!',
    typeCompte: TypeCompte.RH_BASE,
    unitePerimetreCode: 'RC-TROZONA',
    doitChangerMotDePasse: true,
  },
  {
    identifiant: 'chef.bana',
    motDePasse: 'ChefBana@2024!',
    typeCompte: TypeCompte.CHEF_COMMANDEMENT,
    unitePerimetreCode: 'RC-TROZONA',
    doitChangerMotDePasse: true,
  },
];

const SALT_ROUNDS = 12;

export async function seedUtilisateurs(dataSource: DataSource): Promise<void> {
  const compteRepo = dataSource.getRepository(CompteUtilisateur);
  const uniteRepo = dataSource.getRepository(Unite);

  for (const item of COMPTES) {
    const existing = await compteRepo.findOne({ where: { identifiant: item.identifiant } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Compte deja present : ${item.identifiant}`);
      continue;
    }

    let unitePerimetreId: string | null = null;
    if (item.unitePerimetreCode) {
      const unite = await uniteRepo.findOne({ where: { code: item.unitePerimetreCode } });
      if (!unite) {
        // eslint-disable-next-line no-console
        console.warn(
          `Unite ${item.unitePerimetreCode} introuvable pour le compte ${item.identifiant}, ignore.`,
        );
        continue;
      }
      unitePerimetreId = unite.id;
    }

    const motDePasseHash = await hash(item.motDePasse, SALT_ROUNDS);

    const entity = compteRepo.create({
      identifiant: item.identifiant,
      motDePasseHash,
      typeCompte: item.typeCompte,
      personnelId: null,
      unitePerimetreId,
      compteVerrouille: false,
      tentativesEchouees: 0,
      doitChangerMotDePasse: item.doitChangerMotDePasse,
      actif: true,
    });

    await compteRepo.save(entity);
    // eslint-disable-next-line no-console
    console.log(`Compte cree : ${item.identifiant} (${item.typeCompte})`);
  }

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('ATTENTION : comptes de demonstration uniquement.');
  // eslint-disable-next-line no-console
  console.log('Ne jamais utiliser ces identifiants en production.');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('Identifiants de demonstration :');
  for (const c of COMPTES) {
    // eslint-disable-next-line no-console
    console.log(`  ${c.identifiant} / ${c.motDePasse}  [${c.typeCompte}]`);
  }
}

// Reference Base pour eviter un avertissement de variable non utilisee si
// Base n'est pas utilise directement dans ce fichier.
void Base;