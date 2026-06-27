import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

// L'intercepteur de logs etait a 0% de couverture. Ce test verifie qu'il
// journalise bien les 4 metriques cles d'une requete (methode, url, statut,
// duree) sans avoir besoin de lancer toute l'application.
describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('est bien instancie', () => {
    expect(interceptor).toBeDefined();
  });

  it('journalise method, url, statusCode et durationMs', (done) => {
    const req = { method: 'GET', url: '/files' };
    const res = { statusCode: 200 };
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('ok') };

    // On espionne le logger pour capturer la ligne JSON ecrite.
    const logSpy = jest
      .spyOn((interceptor as any).logger, 'log')
      .mockImplementation(() => undefined);

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(logSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(logSpy.mock.calls[0][0] as string);
        expect(logged).toMatchObject({ method: 'GET', url: '/files', statusCode: 200 });
        expect(typeof logged.durationMs).toBe('number');
        done();
      },
    });
  });
});
