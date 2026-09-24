import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppDataSource } from '../data-source';

import { seedBases } from './bases.seed';
import { seedUnites } from './unites.seed';
import { seedGrades } from './grades.seed';
import { seedSpecialites } from './specialites.seed';
import { seedUtilisateurs } from './utilisateurs.seed';

config();

async function run(): Promise<void> {
  const dataSource: DataSource = await AppDataSource.initialize();
  // eslint-disable-next-line no-console
  console.log('Source de donnees initialisee');

  try {
    // eslint-disable-next-line no-console
    console.log('--- Bases ---');
    await seedBases(dataSource);

    // eslint-disable-next-line no-console
    console.log('--- Unites ---');
    await seedUnites(dataSource);

    // eslint-disable-next-line no-console
    console.log('--- Grades ---');
    await seedGrades(dataSource);

    // eslint-disable-next-line no-console
    console.log('--- Specialites ---');
    await seedSpecialites(dataSource);

    // eslint-disable-next-line no-console
    console.log('--- Comptes de demonstration ---');
    await seedUtilisateurs(dataSource);

    // eslint-disable-next-line no-console
    console.log('Seed termine avec succes');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Echec du seed :', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Erreur fatale :', error);
  process.exit(1);
});