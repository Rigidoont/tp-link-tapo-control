import { Command, CommandRunner, Option } from 'nest-commander';
import { TapoPlugCommandOptions } from '../models/tapo-plug-command-options';
import { TapoControlService } from '../services/tapo-control.service';

@Command({
  name: 'tapo-plug',
  description: 'Control Tapo Plug'
})
export class TapoPlugCommand extends CommandRunner {

  constructor(private readonly service: TapoControlService) {
    super()
  }

  async run(
    passedParam: string[],
    options?: TapoPlugCommandOptions,
  ): Promise<void> {
    return this.service.controlPlug(options)
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
    return !!+val
  }

  @Option({
    flags: '-t, --toggle',
    description: 'Toggle the state of the plugs, i.e. invert current state'
  })
  parseToggle(): boolean {
    return true
  }

  @Option({
    flags: '-d, --debug',
    description: 'Enable debugging'
  })
  parseDebug(): boolean {
    return true
  }

}
