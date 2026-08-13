import { GATTServer } from 'embedded:io/bluetoothle/peripheral'
import getMacAddress from 'mac-address'

const DEVICE_NAME = 'M5Stack'
const PSDI_SERVICE_UUID = 'e625601e-9e55-4597-a598-76018a0d293d'
const PSDI_CHARACTERISTIC_UUID = '26e2b12b-85f0-4f3f-9fdd-91d114270e6e'
const USER_SERVICE_UUID = '91e4e176-d0b9-464d-9fe4-52ee3e9f1552'
const WRITE_CHARACTERISTIC_UUID = 'e9062e71-9e62-4bc6-b0d3-35cdcd9b027b'
const NOTIFY_CHARACTERISTIC_UUID = '62fbd229-6edd-4d1a-b554-5c4e1bb29169'

class LineThingsServer {
  #connection
  #io
  #notifyCharacteristic

  constructor () {
    const owner = this
    this.#io = new GATTServer({
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
            }
          ]
        },
        {
          uuid: PSDI_SERVICE_UUID,
          characteristics: [
            {
              uuid: PSDI_CHARACTERISTIC_UUID,
              properties: GATTServer.properties.readEncrypted,
              onRead () {
                return getMacAddress()
              }
            }
          ]
        },
        {
          uuid: USER_SERVICE_UUID,
          characteristics: [
            {
              uuid: WRITE_CHARACTERISTIC_UUID,
              properties: GATTServer.properties.writeEncrypted,
              onWrite (buffer) {
                const bytes = new Uint8Array(buffer)
                if (bytes.length) owner.onWritten?.(bytes[0])
              }
            },
            {
              uuid: NOTIFY_CHARACTERISTIC_UUID,
              properties: GATTServer.properties.subscribeEncrypted,
              onSubscribe (connection) {
                owner.#connection = connection
                owner.#notifyCharacteristic = this
              },
              onUnsubscribe (connection) {
                if (owner.#connection !== connection) return

                owner.#connection = undefined
                owner.#notifyCharacteristic = undefined
              }
            }
          ]
        }
      ],
      onReady () {
        owner.#advertise()
        owner.onStatusChange?.('READY')
      },
      onConnect () {
        this.stopAdvertising()
        owner.onStatusChange?.('CONNECTED')
      },
      onDisconnect () {
        owner.#connection = undefined
        owner.#notifyCharacteristic = undefined
        owner.#advertise()
        owner.onStatusChange?.('READY')
      },
      onWarning (message) {
        trace(`LINE Things BLE warning: ${message}\n`)
      }
    })
  }

  #advertise () {
    this.#io.startAdvertising(
      {
        flags: 6,
        services: [USER_SERVICE_UUID]
      },
      {
        name: DEVICE_NAME
      }
    )
  }

  notify (value) {
    if (!this.#connection || !this.#notifyCharacteristic) return false

    this.#connection.notify(
      this.#notifyCharacteristic,
      Uint8Array.of(value ? 1 : 0)
    )
    return true
  }

  close () {
    this.#io.close()
  }
}

export default LineThingsServer
