import { PartialType } from '@nestjs/swagger';
import { CreateStageMilitaireDto } from './create-stage-militaire.dto';

export class UpdateStageMilitaireDto extends PartialType(CreateStageMilitaireDto) {}