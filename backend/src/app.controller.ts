import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /health (non versionne : utilise par le healthcheck Docker)
  @Get('health')
  @Version(VERSION_NEUTRAL)
  getHealth() {
    return this.appService.getHealth();
  }
}
