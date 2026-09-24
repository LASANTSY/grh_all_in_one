import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonnelsController } from './personnels.controller';
import { PersonnelsService } from './personnels.service';
import { PersonnelsHistoriquesService } from './personnels-historiques.service';
import { PersonnelSearchService } from './services/personnel-search.service';
import { PersonnelDoublonService } from './services/personnel-doublon.service';
import { PersonnelRetraiteService } from './services/personnel-retraite.service';

import { Personnel } from './entities/personnel.entity';
import { Enfant } from './entities/enfant.entity';
import { HistoriqueGrade } from './entities/historique-grade.entity';
import { Affectation } from './entities/affectation.entity';
import { Decoration } from './entities/decoration.entity';
import { CursusScolaire } from './entities/cursus-scolaire.entity';
import { StageMilitaire } from './entities/stage-militaire.entity';
import { CompetenceLinguistique } from './entities/competence-linguistique.entity';

import { Grade } from '../grades/entities/grade.entity';
import { Unite } from '../unites/entities/unite.entity';
import { Specialite } from '../specialites/entities/specialite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personnel,
      Enfant,
      HistoriqueGrade,
      Affectation,
      Decoration,
      CursusScolaire,
      StageMilitaire,
      CompetenceLinguistique,
      Grade,
      Unite,
      Specialite,
    ]),
  ],
  controllers: [PersonnelsController],
  providers: [
    PersonnelsService,
    PersonnelsHistoriquesService,
    PersonnelSearchService,
    PersonnelDoublonService,
    PersonnelRetraiteService,
  ],
  exports: [
    PersonnelsService,
    PersonnelsHistoriquesService,
    PersonnelDoublonService,
    PersonnelRetraiteService,
  ],
})
export class PersonnelsModule {}