export interface TapoPlugCommandOptions {
  email: string;
  password: string;
  aliases?: string[];
  ips?: string[];
  state?: boolean;
  toggle?: boolean;
  debug?: boolean;
}
