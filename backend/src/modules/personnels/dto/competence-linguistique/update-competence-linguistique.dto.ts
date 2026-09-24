import { PartialType } from '@nestjs/swagger';
import { CreateCompetenceLinguistiqueDto } from './create-competence-linguistique.dto';

export class UpdateCompetenceLinguistiqueDto extends PartialType(
  CreateCompetenceLinguistiqueDto,
) {}