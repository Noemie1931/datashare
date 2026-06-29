import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Récupère le JWT depuis le cookie HttpOnly (cas du navigateur), avec repli sur
// l'en-tête Authorization: Bearer (cas des clients API / tests).
const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.access_token || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // Meme secret que celui qui signe le token (auth.module.ts), lu depuis
      // le .env. C'est ce secret qui sert a verifier la signature du JWT.
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
