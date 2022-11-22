Command-line application to control some Tp-Link Tapo devices.  

This is still work in progress, but the app can be used already.

> Expect a noticeable delay when using device aliases instead of IPs.

## Installation

```bash
$ yarn
```

## Building the app

```bash
$ yarn build
```
## Running the app

```bash
# toggle on/off plugs named "MyDevice1" and "MyDevice2"
node ./dist/main tapo-plug -e TAPO_EMAIL_HERE -p TAPO_PASSWORD_HERE -d "MyDevice1,MyDevice2" -t

# turn ON plugs with local IPs "192.168.1.65" and "192.168.1.66"
node ./dist/main tapo-plug -e TAPO_EMAIL_HERE -p TAPO_PASSWORD_HERE -i "192.168.1.65,192.168.1.66" -s 1

# turn OFF plugs with local IP "192.168.1.65"
node ./dist/main tapo-plug -e TAPO_EMAIL_HERE -p TAPO_PASSWORD_HERE -i "192.168.1.65" -s 0
```

