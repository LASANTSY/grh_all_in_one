import { DataSource } from 'typeorm';
import { Base } from '../../modules/bases/entities/base.entity';

interface BaseSeed {
  nom: string;
  ville: string;
}

// Les trois bases citees dans le cahier des charges (section 1)
const BASES: BaseSeed[] = [
  { nom: 'EMMN', ville: 'Antananarivo' },
  { nom: 'BANA', ville: 'Antsiranana' },
  { nom: '2eme BIMA', ville: 'Antsiranana' },
];

export async function seedBases(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Base);

  for (const item of BASES) {
    const existing = await repository.findOne({ where: { nom: item.nom } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Base deja presente : ${item.nom}`);
      continue;
    }
    const entity = repository.create({ nom: item.nom, ville: item.ville, actif: true });
    await repository.save(entity);
    // eslint-disable-next-line no-console
    console.log(`Base creee : ${item.nom}`);
  }
}