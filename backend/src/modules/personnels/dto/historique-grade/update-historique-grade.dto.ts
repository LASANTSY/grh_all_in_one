import { PartialType } from '@nestjs/swagger';
import { CreateHistoriqueGradeDto } from './create-historique-grade.dto';

export class UpdateHistoriqueGradeDto extends PartialType(CreateHistoriqueGradeDto) {}