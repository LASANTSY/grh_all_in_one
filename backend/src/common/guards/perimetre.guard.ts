import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { TypeCompte } from '../enums/type-compte.enum';

/**
 * Guard de perimetre organisationnel.
 *
 * Ce guard n'est PAS enregistre globalement. Il doit etre applique
 * explicitement sur les routes qui manipulent une ressource porteuse d'un
 * perimetre (par exemple un personnel rattache a une unite).
 *
 * Il verifie que l'utilisateur courant a le droit d'acceder a la ressource
 * cible en fonction de son type de compte et de son unite de perimetre.
 *
 * L'extraction de l'unite cible est laissee aux services metier, qui seuls
 * connaissent la ressource. Ce guard ne fait que verifier une unite fournie
 * dans la requete (param, query ou body) via le champ `uniteCibleId`.
 */
@Injectable()
export class PerimetreGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: Record<string, unknown>;
    }>();

    const user = request.user;
    if (!user) {
      return false;
    }

    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return true;
    }

    if (user.typeCompte === TypeCompte.RH_BASE) {
      if (!user.unitePerimetreId) {
        return false;
      }
      const uniteCible =
        request.params?.uniteCibleId ??
        request.query?.uniteCibleId ??
        (typeof request.body?.uniteCibleId === 'string'
          ? (request.body.uniteCibleId as string)
          : undefined);

      if (!uniteCible) {
        return false;
      }
      return uniteCible === user.unitePerimetreId;
    }

    return true;
  }
}