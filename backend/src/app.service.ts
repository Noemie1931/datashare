import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Endpoint de sante (health check) : permet a Docker ou a un load-balancer
  // de verifier que l'API repond, sans toucher a la base de donnees.
  getHealth(): { status: string; service: string } {
    return { status: 'ok', service: 'datashare-api' };
  }
}
