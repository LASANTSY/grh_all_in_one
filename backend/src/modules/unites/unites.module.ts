import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitesController } from './unites.controller';
import { UnitesService } from './unites.service';
import { Unite } from './entities/unite.entity';
import { Base } from '../bases/entities/base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unite, Base])],
  controllers: [UnitesController],
  providers: [UnitesService],
  exports: [UnitesService],
})
export class UnitesModule {}