import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectDemandeDto {
  @ApiProperty({ description: 'Motif du rejet' })
  @IsString()
  @IsNotEmpty({ message: 'Le motif du rejet est obligatoire.' })
  @MaxLength(1000, { message: 'Le motif ne peut pas depasser 1000 caracteres.' })
  motifRejet: string;
}