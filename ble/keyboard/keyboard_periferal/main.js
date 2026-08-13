import { GATTServer } from 'embedded:io/bluetoothle/peripheral'

const DEVICE_NAME = 'Keyboard'
const INPUT_REPORT = new Uint8Array(8)
const REPORT_MAP = Uint8Array.of(
  0x05, 0x01, // Usage Page (Generic Desktop)
  0x09, 0x06, // Usage (Keyboard)
  0xa1, 0x01, // Collection (Application)
  0x05, 0x07, // Usage Page (Keyboard)
  0x19, 0xe0, // Usage Minimum (Left Control)
  0x29, 0xe7, // Usage Maximum (Right GUI)
  0x15, 0x00, // Logical Minimum (0)
  0x25, 0x01, // Logical Maximum (1)
  0x75, 0x01, // Report Size (1)
  0x95, 0x08, // Report Count (8)
  0x81, 0x02, // Input (Data, Variable, Absolute)
  0x95, 0x01, // Report Count (1)
  0x75, 0x08, // Report Size (8)
  0x81, 0x01, // Input (Constant)
  0x95, 0x06, // Report Count (6)
  0x75, 0x08, // Report Size (8)
  0x15, 0x00, // Logical Minimum (0)
  0x25, 0x65, // Logical Maximum (101)
  0x05, 0x07, // Usage Page (Keyboard)
  0x19, 0x00, // Usage Minimum (Reserved)
  0x29, 0x65, // Usage Maximum (Keyboard Application)
  0x81, 0x00, // Input (Data, Array)
  0xc0 // End Collection
)

let protocolMode = 1

function advertise (server) {
  server.startAdvertising({
    flags: 6,
    name: DEVICE_NAME,
    services: ['1812']
  })
}

new GATTServer({
  security: {
    bond: true
  },
  services: [
    {
      uuid: '1800',
      characteristics: [
        {
          uuid: '2a00',
          properties: GATTServer.properties.read,
          value: ArrayBuffer.fromString(DEVICE_NAME)
        },
        {
          uuid: '2a01',
          properties: GATTServer.properties.read,
          value: Uint8Array.of(0xc1, 0x03)
        }
      ]
    },
    {
      uuid: '180a',
      characteristics: [
        {
          uuid: '2a29',
          properties: GATTServer.properties.read,
          value: ArrayBuffer.fromString('Moddable')
        }
      ]
    },
    {
      uuid: '180f',
      characteristics: [
        {
          uuid: '2a19',
          properties: GATTServer.properties.read,
          value: Uint8Array.of(85)
        }
      ]
    },
    {
      uuid: '1812',
      characteristics: [
        {
          uuid: '2a4a',
          properties: GATTServer.properties.read,
          value: Uint8Array.of(0x11, 0x01, 0x00, 0x02)
        },
        {
          uuid: '2a4b',
          properties: GATTServer.properties.readEncrypted,
          value: REPORT_MAP
        },
        {
          uuid: '2a4c',
          properties: GATTServer.properties.writeWithOutResponse,
          onWrite (_buffer) {}
        },
        {
          uuid: '2a4e',
          properties:
            GATTServer.properties.read |
            GATTServer.properties.writeWithOutResponse,
          onRead () {
            return Uint8Array.of(protocolMode)
          },
          onWrite (buffer) {
            const value = new Uint8Array(buffer)[0]
            if (value <= 1) protocolMode = value
          }
        },
        {
          uuid: '2a4d',
          properties:
            GATTServer.properties.readEncrypted |
            GATTServer.properties.subscribeEncrypted,
          onRead () {
            return INPUT_REPORT
          },
          onSubscribe (_connection) {},
          onUnsubscribe (_connection) {},
          descriptors: [
            {
              uuid: '2908',
              value: Uint8Array.of(0, 1)
            }
          ]
        }
      ]
    }
  ],
  onReady () {
    advertise(this)
  },
  onConnect () {
    this.stopAdvertising()
    trace('Keyboard connected\n')
  },
  onDisconnect () {
    trace('Keyboard disconnected\n')
    advertise(this)
  },
  onSecured (_connection, state) {
    trace(`Keyboard secured: encrypted=${state.encrypted}, bonded=${state.bonded}\n`)
  },
  onWarning (message) {
    trace(`Keyboard BLE warning: ${message}\n`)
  }
})
