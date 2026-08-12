import { GATTServer } from 'embedded:io/bluetoothle/peripheral'

const DEVICE_NAME = 'Mai5'
const SERVICE_UUID = '06cbe1e7-f2b7-3646-f601-7a78193af9bd'
const KID_ID_UUID = '6238b7d5-a703-b588-3b0e-6858ba72fd65'

class Mai5Server {
  #io

  constructor ({ kidID, onConnect, onDisconnect }) {
    const owner = this
    this.#io = new GATTServer({
      services: [
        {
          uuid: '1800',
          characteristics: [
            {
              uuid: '2a00',
              properties: GATTServer.properties.read,
              value: ArrayBuffer.fromString(DEVICE_NAME)
            }
          ]
        },
        {
          uuid: SERVICE_UUID,
          characteristics: [
            {
              uuid: KID_ID_UUID,
              properties: GATTServer.properties.read,
              value: ArrayBuffer.fromString(kidID)
            }
          ]
        }
      ],
      onReady () {
        owner.#advertise()
      },
      onConnect () {
        this.stopAdvertising()
        onConnect()
      },
      onDisconnect () {
        owner.#advertise()
        onDisconnect()
      },
      onWarning (message) {
        trace(`Mai5 BLE warning: ${message}\n`)
      }
    })
  }

  #advertise () {
    this.#io.startAdvertising({
      flags: 6,
      name: DEVICE_NAME,
      services: [SERVICE_UUID]
    })
  }

  close () {
    this.#io.close()
  }
}

export default Mai5Server
