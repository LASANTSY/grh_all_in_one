import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function run(): Promise<void> {
  const logger = (msg: string): void => {
    // eslint-disable-next-line no-console
    console.log(`[seeds] ${msg}`);
  };

  logger('Initialisation de la source de donnees...');

  const { AppDataSource } = await import('../database/data-source');
  const { seedBases } = await import('../database/seeds/bases.seed');
  const { seedUnites } = await import('../database/seeds/unites.seed');
  const { seedGrades } = await import('../database/seeds/grades.seed');
  const { seedSpecialites } = await import('../database/seeds/specialites.seed');
  const { seedUtilisateurs } = await import('../database/seeds/utilisateurs.seed');

  const dataSource: DataSource = await AppDataSource.initialize();

  try {
    logger('--- Bases ---');
    await seedBases(dataSource);
    logger('--- Unites ---');
    await seedUnites(dataSource);
    logger('--- Grades ---');
    await seedGrades(dataSource);
    logger('--- Specialites ---');
    await seedSpecialites(dataSource);
    logger('--- Comptes de demonstration ---');
    await seedUtilisateurs(dataSource);
    logger('Seeds termines.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger(`ERREUR lors des seeds : ${message}`);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[seeds] Erreur fatale :', error);
  process.exit(1);
});