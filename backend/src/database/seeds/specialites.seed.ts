import { DataSource } from 'typeorm';
import { Specialite } from '../../modules/specialites/entities/specialite.entity';

/**
 * Specialites de la Marine Nationale.
 *
 * Source : aucune liste explicite n'est fournie dans le cahier des charges
 * ni dans le jeu de donnees. Les valeurs ci-dessous sont un jeu initial
 * raisonnable a ajuster avec le RH.
 *
 * Aucune donnee personnelle n'est presente.
 */
const SPECIALITES: string[] = [
  'Mecanicien naval',
  'Electricien naval',
  'Radio',
  'Detection',
  'Artilleur',
  'Missilier',
  'Plongeur',
  'Fusilier marin',
  'Timonier',
  'Navigateur',
  'Genie maritime',
  'Transmissions',
  'Administration',
  'Commissariat',
  'Logistique',
  'Medical',
  'Informatique',
  'Renseignement',
];

export async function seedSpecialites(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Specialite);

  for (const libelle of SPECIALITES) {
    const existing = await repository.findOne({ where: { libelle } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Specialite deja presente : ${libelle}`);
      continue;
    }
    const entity = repository.create({ libelle, actif: true });
    await repository.save(entity);
    // eslint-disable-next-line no-console
    console.log(`Specialite creee : ${libelle}`);
  }
}