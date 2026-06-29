import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

// Le JWT est déposé dans un cookie HttpOnly : il n'est PAS lisible par JavaScript,
// ce qui protège le jeton du vol par injection de script (XSS). sameSite limite
// l'envoi du cookie à notre propre site, secure impose HTTPS en production.
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours, comme l'expiration du JWT
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto.email, dto.password);
    res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password);
    res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
    return result;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    // Le cookie étant HttpOnly, seul le serveur peut le supprimer.
    res.clearCookie('access_token');
    return { message: 'Déconnecté' };
  }
}
