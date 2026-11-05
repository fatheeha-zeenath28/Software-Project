import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/auth/roles.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  checkHealth() {
    return {
      status: 'ok',
      message: 'AL ICT Platform Backend is running',
      timestamp: new Date().toISOString(),
    };
  }
}