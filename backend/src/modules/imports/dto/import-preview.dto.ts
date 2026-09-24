import { ApiProperty } from '@nestjs/swagger';

export class ImportLigneErreurDto {
  @ApiProperty({ description: 'Numero de ligne dans le fichier (1-based, en-tete exclu)' })
  numeroLigne: number;

  @ApiProperty({ description: 'Champ en erreur' })
  champ: string;

  @ApiProperty({ description: "Message d'erreur lisible" })
  message: string;
}

export class ImportLignePreviewDto {
  @ApiProperty()
  numeroLigne: number;

  @ApiProperty({ description: 'Valeurs brutes lues depuis le fichier' })
  valeurs: Record<string, string | null>;

  @ApiProperty({ description: 'Indique si la ligne est valide (aucune erreur bloquante)' })
  valide: boolean;

  @ApiProperty({ type: [ImportLigneErreurDto] })
  erreurs: ImportLigneErreurDto[];

  @ApiProperty({
    description: 'Identifiant du personnel existant si doublon detecte (matricule ou CIN)',
    nullable: true,
  })
  personnelExistantId: string | null;
}

export class ImportPreviewResponseDto {
  @ApiProperty({ description: 'Identifiant temporaire de la session de preview' })
  previewId: string;

  @ApiProperty()
  nomFichier: string;

  @ApiProperty()
  nombreLignes: number;

  @ApiProperty()
  lignesValides: number;

  @ApiProperty()
  lignesErreur: number;

  @ApiProperty()
  lignesDoublons: number;

  @ApiProperty({ type: [ImportLignePreviewDto] })
  lignes: ImportLignePreviewDto[];

  @ApiProperty({ description: 'Colonnes detectees dans le fichier' })
  colonnes: string[];

  @ApiProperty({ description: 'Colonnes obligatoires manquantes' })
  colonnesManquantes: string[];
}