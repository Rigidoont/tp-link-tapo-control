import { Injectable } from '@nestjs/common';
import { CachedObjectKey } from '../models/cached-object-key.enum';
import { TapoCredentials } from '../models/tapo-credentials';
import { TapoDeviceType } from '../models/tapo-device-type.enum';
import {
  cloudLogin,
  listDevicesByType,
  loginDeviceByIp,
  loginDevice,
  getDeviceInfo,
  TapoDevice,
  TapoDeviceKey,
  TapoDeviceInfo,
} from 'tp-link-tapo-connect';
import { TapoCachingService } from './tapo-caching.service';


@Injectable()
export class TapoApiService {

  private readonly cacheTimeout = 60 * 60 * 24

  constructor(private readonly cachingService: TapoCachingService) {}

  /**
   * Get cloud token that is used to get the list of devices
   * @param credentials
   */
  async getCloudToken(credentials: TapoCredentials): Promise<string> {
    const { email, password } = credentials

    const cachingKey = `${CachedObjectKey.CLOUD_TOKEN}:${email}` as const
    const cachedCloudToken = await this.cachingService.getItem<string>(cachingKey)

    const cloudToken = cachedCloudToken ?? await cloudLogin(email, password)

    if (!cachedCloudToken) {
      await this.cache(cachingKey, cloudToken)
    }

    return cloudToken
  }

  /**
   * Get list of devices of certain type
   * @param credentials
   * @param deviceType
   * @param forceRefresh
   */
  async getDevicesByType(
    credentials: TapoCredentials,
    deviceType: TapoDeviceType,
    forceRefresh = false
  ): Promise<TapoDevice[]> {
    const cloudToken = await this.getCloudToken(credentials)

    const cachingKey = `${CachedObjectKey.DEVICES}:${credentials.email}` as const
    const cachedDevices = !forceRefresh
      ? await this.cachingService.getItem<TapoDevice[]>(cachingKey)
      : null

    const devicesList: TapoDevice[] = cachedDevices
      ?? await listDevicesByType(cloudToken, deviceType)

    if (!cachedDevices) {
      await this.cache(cachingKey, devicesList)
    }

    return devicesList
  }

  /**
   * Get the key necessary to control the device.
   * @param credentials
   * @param deviceOrIp
   */
  async getDeviceKey(
    credentials: TapoCredentials,
    deviceOrIp: TapoDevice | string
  ): Promise<TapoDeviceKey> {
    const { email, password } = credentials

    const ip = typeof deviceOrIp === 'string' ? deviceOrIp : deviceOrIp?.ip
    const device = typeof deviceOrIp === 'string' ? undefined : deviceOrIp
    console.warn(deviceOrIp, device)


    const cachingKey = `${CachedObjectKey.DEVICE_KEY}:${ip || device.deviceId}` as const
    const cachedDeviceKey = await this.cachingService.getItem<TapoDeviceKey>(cachingKey)
    if (cachedDeviceKey) {
      cachedDeviceKey.key = Buffer.from(cachedDeviceKey.key as any, 'base64')
      cachedDeviceKey.iv = Buffer.from(cachedDeviceKey.iv as any, 'base64')
    }

    console.warn(cachedDeviceKey)
    const deviceKey: TapoDeviceKey = cachedDeviceKey
      ?? (
        ip
          ? await loginDeviceByIp(email, password, ip)
          : await loginDevice(email, password, device)
      )


    console.warn(deviceKey, cachedDeviceKey === deviceKey)
    if (!cachedDeviceKey) {
      await this.cache(cachingKey, {
        ...deviceKey,
        key: deviceKey.key.toString('base64'),
        iv: deviceKey.iv.toString('base64')
      })
    }

    return deviceKey
  }

  /**
   * Get information about the device, including its current state
   * @param deviceKey
   */
  async getDeviceInfo(deviceKey: TapoDeviceKey): Promise<TapoDeviceInfo> {
    return getDeviceInfo(deviceKey)
  }

  private cache<T>(key: `${CachedObjectKey}:${string}`, data: T): Promise<void> {
    return this.cachingService.setItem(key, data, this.cacheTimeout)
  }

}
