import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasesController } from './bases.controller';
import { BasesService } from './bases.service';
import { Base } from './entities/base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Base])],
  controllers: [BasesController],
  providers: [BasesService],
  exports: [BasesService],
})
export class BasesModule {}