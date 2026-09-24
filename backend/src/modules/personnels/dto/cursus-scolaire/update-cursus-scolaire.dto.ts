import { PartialType } from '@nestjs/swagger';
import { CreateCursusScolaireDto } from './create-cursus-scolaire.dto';

export class UpdateCursusScolaireDto extends PartialType(CreateCursusScolaireDto) {}