import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialitesController } from './specialites.controller';
import { SpecialitesService } from './specialites.service';
import { Specialite } from './entities/specialite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialite])],
  controllers: [SpecialitesController],
  providers: [SpecialitesService],
  exports: [SpecialitesService],
})
export class SpecialitesModule {}