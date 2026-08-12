import { GATTServer } from 'embedded:io/bluetoothle/peripheral'
import QRMessageBuffer from 'qr-message'

const DEVICE_NAME = 'SendQR'
const SERVICE_UUID = '6b0d0503-dcaa-4041-8ab4-630d7d9017dc'
const CHARACTERISTIC_UUID = 'bea0c847-4238-40d2-b693-4dadab33395e'
const MAX_QR_BYTES = 200

function createQRServer ({ onQRChange }) {
  let server
  const messages = new QRMessageBuffer({
    maxBytes: MAX_QR_BYTES,
    onMessage (buffer) {
      onQRChange(String.fromArrayBuffer(buffer))
    }
  })

  function advertise () {
    server.startAdvertising({
      flags: 6,
      name: DEVICE_NAME,
      services: [SERVICE_UUID]
    })
  }

  server = new GATTServer({
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
            uuid: CHARACTERISTIC_UUID,
            properties: GATTServer.properties.write,
            onWrite (buffer) {
              if (!messages.write(buffer)) {
                trace(`QR message exceeds ${MAX_QR_BYTES} bytes\n`)
              }
            }
          }
        ]
      }
    ],
    onReady () {
      advertise()
    },
    onConnect () {
      this.stopAdvertising()
    },
    onDisconnect () {
      messages.reset()
      advertise()
    },
    onWarning (message) {
      trace(`QR BLE warning: ${message}\n`)
    }
  })

  return server
}

export { MAX_QR_BYTES }
export default createQRServer
