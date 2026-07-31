import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'PhotoOS API Running',
      service: 'photoos-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'photoos-api',
      timestamp: new Date().toISOString(),
    };
  }
}

