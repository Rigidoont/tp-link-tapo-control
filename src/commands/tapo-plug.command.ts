import { Command, CommandRunner, Option } from 'nest-commander';
import { cloudLogin, getDeviceInfo, listDevicesByType, loginDevice, loginDeviceByIp, TapoDevice, TapoDeviceKey, turnOff, turnOn } from "tp-link-tapo-connect";

interface TapoPlugCommandOptions {
  email: string;
  password: string;
  aliases?: string[];
  ips?: string[];
  state?: boolean;
  toggle?: boolean;
}

@Command({
  name: 'tapo-plug',
  description: 'Control Tapo Plug'
})
export class TapoPlugCommand extends CommandRunner {

  constructor() {
    super()
  }

  async run(
    passedParam: string[],
    options?: TapoPlugCommandOptions,
  ): Promise<void> {

    const { email, password, aliases, ips, state, toggle } = options
    console.warn(options)

    const cloudToken = await cloudLogin(email, password);
    const devicesList = await listDevicesByType(cloudToken, 'SMART.TAPOPLUG');

    const devicesListFiltered: TapoDevice[] = aliases?.length
      ? devicesList.filter(device => aliases.includes(device.alias))
      : []

    // console.warn(devicesList, devicesListFiltered)

    if (!devicesListFiltered.length && !ips?.length) return

    let deviceTokenReqs: Promise<any>[] = []

    if (devicesListFiltered.length) {
      deviceTokenReqs = deviceTokenReqs.concat(
        devicesListFiltered.map(device => loginDevice(email, password, device))
      )
    }

    if (ips?.length) {
      deviceTokenReqs = deviceTokenReqs.concat(
        ips.map(ip => loginDeviceByIp(email, password, ip))
      )
    }

    if (!deviceTokenReqs.length) return

    const deviceTokens: TapoDeviceKey[] = await Promise.all(deviceTokenReqs)

    await Promise.allSettled(deviceTokens.map(async (deviceToken, i) => {
      if (state === true) return turnOn(deviceToken)
      if (state === false) return turnOff(deviceToken)
      if (toggle) {

        const info = await getDeviceInfo(deviceToken)
        // console.warn(info)

        if (info.device_on) await turnOff(deviceToken)
        else await turnOn(deviceToken)
      }
    }))


  }

  @Option({
    flags: '-e, --email <email>',
    required: true,
    description: 'Tp-link could account email'
  })
  parseEmail(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --password <password>',
    required: true,
    description: 'Tp-link could account password'
  })
  parsePassword(val: string): string {
    return val;
  }

  @Option({
    flags: '-a, --aliases <aliases>',
    description: 'Aliases of the devices to apply actions to'
  })
  parseDevices(val: string): string[] {
    return val.split(',');
  }

  @Option({
    flags: '-i, --ips <ips>',
    description: 'IPs of the devices to apply actions to'
  })
  parseIps(val: string): string[] {
    return val.split(',');
  }

  @Option({
    flags: '-s, --state <state>',
    description: 'New state for the plugs (on/off)'
  })
  parseState(val: string): boolean {
    console.warn(val, !!+val)
    return !!+val
  }

  @Option({
    flags: '-t, --toggle',
    description: 'Toggle the state of the plugs, i.e. invert current state'
  })
  parseToggle(): boolean {
    return true
  }


}
