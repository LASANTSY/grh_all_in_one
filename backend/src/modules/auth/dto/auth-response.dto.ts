import { ApiProperty } from '@nestjs/swagger';
import { TypeCompte } from '../../../common/enums/type-compte.enum';

export class AuthenticatedUserDto {
  @ApiProperty()
  compteId: string;

  @ApiProperty()
  identifiant: string;

  @ApiProperty({ enum: TypeCompte })
  typeCompte: TypeCompte;

  @ApiProperty({ nullable: true })
  personnelId: string | null;

  @ApiProperty({ nullable: true })
  unitePerimetreId: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}