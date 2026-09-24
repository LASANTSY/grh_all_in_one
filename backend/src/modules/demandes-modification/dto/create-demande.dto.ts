import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Liste blanche des champs modifiables par un agent via le workflow de validation.
 *
 * Conformement au CDC section 2.6b :
 *   "Certains champs sensibles ou officiels (grade, matricule, decorations,
 *    affectations, decisions...) doivent rester non modifiables par l agent
 *    lui-meme et necessiter une validation par le RH."
 *
 * La liste ci-dessous est un choix d implementation : elle sera affinee avec
 * le RH dans le tableau des droits (matrice champ x role).
 */
export const CHAMPS_MODIFIABLES_PERSONNEL = [
  'email',
  'telephoneMobile',
  'adresseActuelle',
  'adresseRepli',
  'contactUrgence',
  'statutFamilial',
  'nomConjoint',
  'dateNaissanceConjoint',
  'lieuNaissanceConjoint',
  'fonctionConjoint',
  'sportsPratiques',
  'connaissancesInformatiques',
  'photoUrl',
] as const;

export type ChampModifiablePersonnel = (typeof CHAMPS_MODIFIABLES_PERSONNEL)[number];

export class CreateDemandeModificationDto {
  @ApiProperty({
    enum: CHAMPS_MODIFIABLES_PERSONNEL,
    description: 'Champ de la fiche a modifier',
  })
  @IsIn(CHAMPS_MODIFIABLES_PERSONNEL, {
    message: 'Ce champ ne peut pas etre modifie via le workflow de validation.',
  })
  champModifie: ChampModifiablePersonnel;

  @ApiProperty({ description: 'Nouvelle valeur proposee' })
  @IsString()
  @IsNotEmpty({ message: 'La nouvelle valeur est obligatoire.' })
  @MaxLength(2000, { message: 'La nouvelle valeur est trop longue.' })
  nouvelleValeur: string;
}