import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade])],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}