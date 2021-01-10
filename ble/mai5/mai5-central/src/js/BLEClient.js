const DEVICE_NAME = 'Mai5'
const SERVICE_UUID = '06cbe1e7-f2b7-3646-f601-7a78193af9bd'
const CHARACTERISTIC_UUID = '6238b7d5-a703-b588-3b0e-6858ba72fd65'

class BLEClient {
  consturctor () {
    this.isConnected = false
    this.connectedCharacteristic = null
  }

  async connect () {
    if (navigator.bluetooth == null) {
      console.warn('bluetooth not available')
      return
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        filters: [{ name: DEVICE_NAME }, { services: [SERVICE_UUID] }]
      })
      device.addEventListener('gattserverdisconnected', () => {
        this._onDisconnected()
      })
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(SERVICE_UUID)
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
      this._onConnected(characteristic)
    } catch (e) {
      console.log(e)
    }
  }

  _onConnected (characteristic) {
    this.isConnected = true
    this.connectedCharacteristic = characteristic
    if (this.onConnected != null && typeof this.onConnected === 'function') {
      this.onConnected(characteristic)
    }
  }

  _onDisconnected () {
    this.isConnected = false
    this.connectedCharacteristic = null
    if (
      this.onDisconnected != null &&
      typeof this.onDisconnected === 'function'
    ) {
      this.onDisconnected()
    }
  }
}

export default BLEClient
