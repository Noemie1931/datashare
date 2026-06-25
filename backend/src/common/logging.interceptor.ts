import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Journalise chaque requête HTTP au format structuré (JSON) : méthode, route,
// code de statut et temps de réponse. Permet de suivre les métriques clés
// (latence par endpoint) et de repérer les requêtes lentes ou en erreur.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const durationMs = Date.now() - start;
        this.logger.log(
          JSON.stringify({
            method,
            url,
            statusCode: res.statusCode,
            durationMs,
          }),
        );
      }),
    );
  }
}
