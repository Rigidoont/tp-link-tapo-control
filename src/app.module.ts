import { Module } from '@nestjs/common';
import { TapoPlugCommand } from './commands/tapo-plug.command';
import { TapoCachingService } from './services/tapo-caching.service';
import { TapoControlService } from './services/tapo-control.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    TapoPlugCommand,
    TapoControlService,
    TapoCachingService,
  ],
})
export class AppModule {}
