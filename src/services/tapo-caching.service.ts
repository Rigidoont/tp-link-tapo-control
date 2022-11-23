import { Injectable } from '@nestjs/common';
import Datastore from '@seald-io/nedb';
import { CachedObject } from 'src/models/cached-object';

const Nedb = require('@seald-io/nedb')

@Injectable()
export class TapoCachingService {

  private readonly store: Datastore

  constructor() {
    this.store = new Nedb({
      filename: 'store.json',
      autoload: true
    })
  }

  async getItem<T>(key: string): Promise<T | undefined> {
    // await this.store.autoloadPromise
    const item = await this.store
      .findAsync<CachedObject<T>>({ name: key })
      .limit(1)
      .sort({ createdAt: -1 })
      .execAsync()
    return item[0]?.content
  }

  async setItem<T>(key: string, data: T, ttl: number): Promise<void> {
    // await this.store.autoloadPromise
    const item = new CachedObject(key, data, ttl)
    const s = await this.store.updateAsync({ name: key }, item, { upsert: true })
    console.warn(s)

    return
  }

  async cleanup(): Promise<void> {
    await this.store.removeAsync(
      { expiresAt: { $lwe: new Date().getTime() } },
      { multi: true }
    )
    await this.store.compactDatafileAsync()
  }

}
