const SERVICE_UUID = '06cbe1e7-f2b7-3646-f601-7a78193af9bd'

class BLEClient {
  constructor (bluetooth = globalThis.navigator?.bluetooth) {
    this.bluetooth = bluetooth
    this.device = undefined
    this.isConnected = false
  }

  async connect () {
    if (!this.bluetooth) {
      throw new Error('Web Bluetooth is not available in this browser')
    }
    if (this.isConnected) return

    let device
    try {
      device = await this.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      })
      device.addEventListener(
        'gattserverdisconnected',
        () => this.#handleDisconnected()
      )
      if (!device.gatt) throw new Error('Bluetooth device has no GATT server')

      const server = await device.gatt.connect()
      await server.getPrimaryService(SERVICE_UUID)
      this.device = device
      this.isConnected = true
      this.onConnected?.()
    } catch (error) {
      device?.gatt?.disconnect()
      throw error
    }
  }

  #handleDisconnected () {
    this.device = undefined
    this.isConnected = false
    this.onDisconnected?.()
  }
}

export { SERVICE_UUID }
export default BLEClient
