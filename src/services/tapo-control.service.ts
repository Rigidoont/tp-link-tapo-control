import { Injectable } from '@nestjs/common';
import { TapoCachingService } from './tapo-caching.service';


@Injectable()
export class TapoControlService {

  constructor(
    private readonly cachingService: TapoCachingService,
  ) {}





}
