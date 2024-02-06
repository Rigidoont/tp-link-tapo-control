import { Injectable } from '@nestjs/common';
import { TapoDevice } from 'tp-link-tapo-connect';
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
      const devicesList = await this.apiService.getDevices(
        credentials,
        TapoDeviceType.SMART_PLUG
      );

      devicesListFiltered =
        devicesList.filter(device => aliases.includes(device.alias))

      if (debug) console.warn({ devicesList, devicesListFiltered })
    }

    const devices = await Promise.all([
      ...(devicesListFiltered ?? []),
      ...(ips ?? [])
     ].map(item => this.apiService.loginDevice(credentials, item))
    )

    if (!devices.length) return

    await Promise.allSettled(devices.map(async (device, i) => {
      if (state === true) return device.turnOn()
      if (state === false) return device.turnOff()
      if (toggle) {
        const info = await device.getDeviceInfo()
        if (debug) console.warn(info)

        if (info.device_on) await device.turnOff()
        else await device.turnOn()
      }
    }))
  }


}
