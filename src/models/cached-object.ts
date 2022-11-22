
export class CachedObject<T> {

  content: T;

  /** Creation time in ms */
  createdAt: number;

  /** Time to live in ms */
  expiresIn: number;

  constructor(content: T, expiresIn: number) {
    this.content = content
    this.expiresIn = expiresIn
    this.createdAt = new Date().getTime()
  }

}
