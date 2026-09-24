import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PieceJointe } from './entities/piece-jointe.entity';
import { VersionPieceJointe } from './entities/version-piece-jointe.entity';
import { Personnel } from '../personnels/entities/personnel.entity';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';
import { STORAGE_SERVICE } from './storage/storage.interface';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PieceJointe, VersionPieceJointe, Personnel]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, LocalStorageService, S3StorageService],
      useFactory: (
        configService: ConfigService,
        local: LocalStorageService,
        s3: S3StorageService,
      ) => {
        const driver = configService.get<string>('storage.driver', 'local');
        return driver === 's3' ? s3 : local;
      },
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}