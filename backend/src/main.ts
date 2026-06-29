import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS : l'origine autorisée vient d'une variable d'environnement (jamais codée
  // en dur). En dev, défaut sur le front local ; en prod, on passe le vrai domaine.
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

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