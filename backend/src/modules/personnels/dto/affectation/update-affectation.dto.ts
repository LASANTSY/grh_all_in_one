import { PartialType } from '@nestjs/swagger';
import { CreateAffectationDto } from './create-affectation.dto';

export class UpdateAffectationDto extends PartialType(CreateAffectationDto) {}
