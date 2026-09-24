import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { appConfig } from '../config/app.config';
import { databaseConfig } from '../config/database.config';
import { jwtConfig } from '../config/jwt.config';
import { storageConfig } from '../config/storage.config';
import { envValidationSchema } from '../config/validation.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { AuthModule } from '../modules/auth/auth.module';
import { UtilisateursModule } from '../modules/utilisateurs/utilisateurs.module';
import { BasesModule } from '../modules/bases/bases.module';
import { UnitesModule } from '../modules/unites/unites.module';
import { GradesModule } from '../modules/grades/grades.module';
import { SpecialitesModule } from '../modules/specialites/specialites.module';
import { PersonnelsModule } from '../modules/personnels/personnels.module';
import { DocumentsModule } from '../modules/documents/documents.module';
import { ImportsModule } from '../modules/imports/imports.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { DemandesModule } from '../modules/demandes-modification/demandes.module';
import { AuditModule } from '../modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, jwtConfig, storageConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: config.get<boolean>('database.logging', false),
        ssl: config.get<boolean>('database.ssl', false) ? { rejectUnauthorized: false } : false,
        autoLoadEntities: false,
      }),
    }),
    AuthModule,
    UtilisateursModule,
    BasesModule,
    UnitesModule,
    GradesModule,
    SpecialitesModule,
    PersonnelsModule,
    DocumentsModule,
    ImportsModule,
    DashboardModule,
    DemandesModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}