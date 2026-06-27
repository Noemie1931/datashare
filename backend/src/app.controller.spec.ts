import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Couvre app.controller.ts et app.service.ts (etaient a 0%).
describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = moduleRef.get<AppController>(AppController);
  });

  it('GET /health renvoie le statut du service', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok', service: 'datashare-api' });
  });
});
