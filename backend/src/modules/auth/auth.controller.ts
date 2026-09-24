import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService, LoginResult, RefreshResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service';

const REFRESH_COOKIE_NAME = 'refresh_token';

interface RefreshRequest extends Request {
  user: { compteId: string; tokenId: string; refreshToken: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilisateursService: UtilisateursService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authentification d un utilisateur' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const adresseIp = this.extractIp(req);
    const userAgent = (req.headers['user-agent'] ?? '').toString().slice(0, 255) || null;

    const result: LoginResult = await this.authService.login(dto.identifiant, dto.motDePasse, {
      adresseIp,
      userAgent,
    });

    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraichir le token d acces' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result: RefreshResult = await this.authService.refresh(
      req.user.refreshToken,
      req.user.tokenId,
    );

    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deconnexion de l utilisateur courant' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.[REFRESH_COOKIE_NAME];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearRefreshCookie(res);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Changer le mot de passe de l utilisateur courant' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.utilisateursService.changePassword(
      user.compteId,
      dto.motDePasseActuel,
      dto.nouveauMotDePasse,
    );

    await this.authService.revokeAllForCompte(user.compteId);

    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    this.clearRefreshCookie(res);
  }

  private setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      expires: expiresAt,
      path: '/api/auth',
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  }

  private extractIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip ?? null;
  }
}