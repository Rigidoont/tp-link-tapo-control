import { Injectable } from '@nestjs/common';
import { CachedObjectKey as CoKey } from '../models/cached-object-key.enum';
import { TapoCredentials } from '../models/tapo-credentials';
import { TapoDeviceType } from '../models/tapo-device-type.enum';
import {
  cloudLogin,
  loginDeviceByIp,
  loginDevice,
  TapoDevice,
} from 'tp-link-tapo-connect';
import { TapoCachingService } from './tapo-caching.service';


@Injectable()
export class TapoApiService {

  private readonly cacheTimeout = 60 * 60 * 24


  constructor(private readonly cachingService: TapoCachingService) {}

  /**
   * Get list of devices of certain type
   * @param credentials
   * @param deviceType
   * @param forceRefresh
   */
  async getDevices(
    credentials: TapoCredentials,
    deviceType?: TapoDeviceType,
    forceRefresh = false
  ): Promise<TapoDevice[]> {
    const cloudApi = await cloudLogin(credentials.email, credentials.password)

    const { email } = credentials
    const cachingKey = `${CoKey.DEVICES}:${email}:${deviceType ?? 'all'}` as const
    const cachedDevices = !forceRefresh
      ? await this.cachingService.getItem<TapoDevice[]>(cachingKey)
      : null

    const devicesList: TapoDevice[] = cachedDevices
      ?? (
        deviceType
          ? await cloudApi.listDevicesByType(deviceType)
          : await cloudApi.listDevices()
      )

    if (!cachedDevices) {
      await this.cache(cachingKey, devicesList)
    }

    console.warn('devicesList', devicesList)
    return devicesList
  }

  /**
   * Login to control the device.
   * @param credentials
   * @param deviceOrIp
   */
  async loginDevice(
    credentials: TapoCredentials,
    deviceOrIp: TapoDevice | string
  ): Promise<ReturnType<typeof loginDeviceByIp>> {
    const { email, password } = credentials

    const ip = typeof deviceOrIp === 'string' ? deviceOrIp : deviceOrIp?.ip
    const deviceId = typeof deviceOrIp === 'string' ? undefined : deviceOrIp

    return ip
      ? await loginDeviceByIp(email, password, ip)
      : await loginDevice(email, password, deviceId)
  }

  private cache<T>(key: `${CoKey}:${string}`, data: T): Promise<void> {
    return this.cachingService.setItem(key, data, this.cacheTimeout)
  }

}
