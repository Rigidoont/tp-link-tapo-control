import { Injectable } from '@nestjs/common';
import { TapoApiService } from './tapo-api.service';


@Injectable()
export class TapoControlService {

  constructor(
    private readonly apiService: TapoApiService
  ) {}


}
