import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const ACTION_IMPORT_VALUES = ['CREATION', 'MISE_A_JOUR', 'IGNOREE'] as const;
export type ActionImport = (typeof ACTION_IMPORT_VALUES)[number];

export class ImportLigneDecisionDto {
  @ApiProperty({ description: 'Numero de ligne dans le fichier' })
  @IsInt()
  @Min(1)
  numeroLigne: number;

  @ApiProperty({ enum: ACTION_IMPORT_VALUES })
  @IsIn(ACTION_IMPORT_VALUES)
  action: ActionImport;
}

export class ImportExecuteDto {
  @ApiProperty({ description: 'Identifiant de la preview a executer' })
  @IsUUID('4')
  previewId: string;

  @ApiProperty({
    type: [ImportLigneDecisionDto],
    description:
      "Decisions pour les lignes en doublon. Les lignes valides non listees sont creees automatiquement.",
  })
  @IsArray()
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => ImportLigneDecisionDto)
  decisions: ImportLigneDecisionDto[];

  @ApiProperty({
    required: false,
    description: "Commentaire optionnel sur l'import",
  })
  @IsOptional()
  @IsNotEmpty()
  commentaire?: string;
}