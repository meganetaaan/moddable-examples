import BLEServer from 'bleserver'
import { uuid } from 'btutils'

const DEVICE_NAME = 'SendQR'
const SERVICE_UUID = '6b0d0503-dcaa-4041-8ab4-630d7d9017dc' // sendqr service

class QRServer extends BLEServer {
  onReady () {
    this.qr = ''
    this.deviceName = DEVICE_NAME
    this.onDisconnected()
  }
  onConnected (connection) {
    this.stopAdvertising()
  }
  onDisconnected (connection) {
    this.startAdvertising({
      advertisingData: {
        flags: 6,
        completeName: DEVICE_NAME,
        completeUUID128List: [uuid([SERVICE_UUID])]
      }
    })
  }
  onCharacteristicWritten (params, value) {
    if (params.name === 'qr') {
      const strValue = String.fromArrayBuffer(value)
      if (strValue === '\r') {
        if (typeof this.onQRChange === 'function') {
          this.onQRChange(this.qr)
        }
        this.qr = ''
      }
      this.qr += strValue
    }
  }
}

export default QRServer
