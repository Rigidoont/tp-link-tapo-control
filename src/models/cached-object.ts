
export class CachedObject<T> {

  content: T;

  name: string;

  /** Creation time in ms */
  createdAt: number;

  /** Time to live in ms */
  expiresIn: number;

  /** Expiration time in ms */
  expiresAt: number;

  constructor(name: string, content: T, expiresIn: number) {
    this.name = name
    this.content = content
    this.expiresIn = expiresIn
    this.createdAt = new Date().getTime()
    this.expiresAt = this.createdAt + expiresIn
  }

}
