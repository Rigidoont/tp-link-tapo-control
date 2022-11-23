import { Injectable } from '@nestjs/common';
import { cloudLogin, getDeviceInfo, listDevicesByType, loginDevice, loginDeviceByIp, TapoDevice, TapoDeviceKey, turnOff, turnOn } from 'tp-link-tapo-connect';
import { TapoCredentials } from '../models/tapo-credentials';
import { TapoDeviceType } from '../models/tapo-device-type.enum';
import { TapoPlugCommandOptions } from '../models/tapo-plug-command-options';
import { TapoApiService } from './tapo-api.service';


@Injectable()
export class TapoControlService {

  constructor(
    private readonly apiService: TapoApiService
  ) {}

  async controlPlug(options?: TapoPlugCommandOptions): Promise<void> {
    const { email, password, aliases, ips, state, toggle, debug } = options
    const credentials: TapoCredentials = { email, password }
    if (debug) console.warn(options)

    let devicesListFiltered: TapoDevice[] = []

    if (aliases?.length) {
      const devicesList = await this.apiService.getDevicesByType(
        credentials,
        TapoDeviceType.SMART_PLUG
      );

      devicesListFiltered =
        devicesList.filter(device => aliases.includes(device.alias))

      if (debug) console.warn({ devicesList, devicesListFiltered })
    }

    const deviceKeys: TapoDeviceKey[] = await Promise.all([
      ...(devicesListFiltered ?? []),
      ...(ips ?? [])
     ].map(item => this.apiService.getDeviceKey(credentials, item))
    )

    if (!deviceKeys.length) return

    await Promise.allSettled(deviceKeys.map(async (deviceKey, i) => {
      if (state === true) return turnOn(deviceKey)
      if (state === false) return turnOff(deviceKey)
      if (toggle) {

        const info = await this.apiService.getDeviceInfo(deviceKey)
        if (debug) console.warn(info)

        if (info.device_on) await turnOff(deviceKey)
        else await turnOn(deviceKey)
      }
    }))
  }


}
