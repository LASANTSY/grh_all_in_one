import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Personnel } from '../personnels/entities/personnel.entity';
import { Unite } from '../unites/entities/unite.entity';
import { Grade } from '../grades/entities/grade.entity';
import { PersonnelsModule } from '../personnels/personnels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personnel, Unite, Grade]),
    PersonnelsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}