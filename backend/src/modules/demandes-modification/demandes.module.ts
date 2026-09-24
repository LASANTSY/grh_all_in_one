import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { DemandeModification } from './entities/demande-modification.entity';
import { CompteUtilisateur } from '../utilisateurs/entities/compte-utilisateur.entity';
import { Personnel } from '../personnels/entities/personnel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeModification, CompteUtilisateur, Personnel]),
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
  exports: [DemandesService],
})
export class DemandesModule {}