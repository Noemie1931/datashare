import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lit les cookies des requêtes (dont le cookie HttpOnly qui porte le JWT).
  app.use(cookieParser());

  // CORS : l'origine autorisée vient d'une variable d'environnement (jamais codée
  // en dur). credentials:true autorise l'envoi du cookie d'authentification.
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Versionnage des routes par URI : les routes métier deviennent /v1/...
  // (les routes publiques /d/... et /health restent neutres, voir @Version).
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Validation automatique des entrées via les DTO (class-validator).
  // whitelist : retire les champs non déclarés ; transform : convertit les types.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Journalisation structurée de toutes les requêtes (méthode, route, statut, latence)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Documentation interactive de l'API (Swagger UI) servie sur /api
  const config = new DocumentBuilder()
    .setTitle('DataShare API')
    .setDescription('API de partage de fichiers par lien temporaire')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();