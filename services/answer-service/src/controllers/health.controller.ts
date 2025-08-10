import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: 'OK',
      service: 'answer-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
} 