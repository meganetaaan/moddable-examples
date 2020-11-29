import BLEServer from 'bleserver'
import { uuid } from 'btutils'

const DEVICE_NAME = 'Mai5'
const SERVICE_UUID = '06cbe1e7-f2b7-3646-f601-7a78193af9bd' // sendqr service

class Mai5Server extends BLEServer {
  onReady () {
    this.deviceName = DEVICE_NAME
    this.onDisconnected()
  }
  onConnected (connection) {
    this.stopAdvertising()
    if (typeof this.onConnect === 'function') {
      this.onConnect()
    }
  }
  onDisconnected (connection) {
    if (typeof this.onDisconnect === 'function') {
      this.onDisconnect()
    }
    this.startAdvertising({
      advertisingData: {
        flags: 6,
        completeName: DEVICE_NAME,
        completeUUID128List: [uuid([SERVICE_UUID])]
      }
    })
  }
}

export default Mai5Server
