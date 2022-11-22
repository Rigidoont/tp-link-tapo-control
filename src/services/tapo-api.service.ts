import { Injectable } from '@nestjs/common';
import { CachedObject } from '../models/cached-object';
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


/**
 * NOT FINISHED, NOT WORKING
 */
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

    // todo check for cached token
    const cachedCloudToken: CachedObject = await Promise.resolve()
    const cloudToken = cachedCloudToken?.content
      ?? await cloudLogin(email, password)

    if (cachedCloudToken) {
      new CachedObject(cloudToken, this.cacheTimeout)
      // todo cache object
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

    const cachedDevices = forceRefresh ? null : new CachedObject(null, 1) // todo
    const devicesList: TapoDevice[] = cachedDevices?.content
      ?? await listDevicesByType(cloudToken, deviceType)

    if (!cachedDevices) {
      new CachedObject(devicesList, this.cacheTimeout)
      // todo cache object
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

    const ip = typeof deviceOrIp === 'string' ? deviceOrIp : deviceOrIp.ip
    const device = typeof deviceOrIp === 'string' ? undefined : deviceOrIp

    const cachedDeviceKey = new CachedObject<TapoDeviceKey>(null, 1) // todo
    const deviceKey: TapoDeviceKey = cachedDeviceKey?.content
      ?? ip
        ? await loginDeviceByIp(email, password, ip)
        : await loginDevice(email, password, device)

    return deviceKey
  }

  /**
   * Get information about the device, including its current state
   * @param deviceKey
   */
  async getDeviceInfo(deviceKey: TapoDeviceKey): Promise<TapoDeviceInfo> {
    return getDeviceInfo(deviceKey)
  }


}
