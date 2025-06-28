import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService, // Example of injecting ConfigService
  ) {}

  @Get()
  getHello(): string {
    // Example of accessing environment variables
    const dbHost = this.configService.get<string>('DB_HOST');
    console.log('DB_HOST from AppController:', dbHost);
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
