import { Module } from '@nestjs/common';
import { TapoPlugCommand } from './commands/tapo-plug.command';

@Module({
  imports: [],
  controllers: [],
  providers: [TapoPlugCommand],
})
export class AppModule {}
