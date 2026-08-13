const SERVICE_UUID = '6b0d0503-dcaa-4041-8ab4-630d7d9017dc'
const CHARACTERISTIC_UUID = 'bea0c847-4238-40d2-b693-4dadab33395e'
const MAX_CHUNK_BYTES = 20
const MAX_QR_BYTES = 200

class BLEClient {
  constructor (bluetooth = globalThis.navigator?.bluetooth) {
    this.bluetooth = bluetooth
    this.device = undefined
    this.isConnected = false
    this.characteristic = undefined
  }

  async sendText (text) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Bluetooth device is not connected')
    }
    if (text.includes('\r')) {
      throw new RangeError('QR text cannot contain a carriage return')
    }

    const bytes = new TextEncoder().encode(text)
    if (bytes.byteLength > MAX_QR_BYTES) {
      throw new RangeError(`QR text must be at most ${MAX_QR_BYTES} UTF-8 bytes`)
    }

    for (let offset = 0; offset < bytes.byteLength; offset += MAX_CHUNK_BYTES) {
      await this.characteristic.writeValueWithResponse(
        bytes.subarray(offset, offset + MAX_CHUNK_BYTES)
      )
    }
    await this.characteristic.writeValueWithResponse(Uint8Array.of(0x0d))
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
      const service = await server.getPrimaryService(SERVICE_UUID)
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
      this.device = device
      this.characteristic = characteristic
      this.isConnected = true
      this.onConnected?.()
    } catch (error) {
      device?.gatt?.disconnect()
      throw error
    }
  }

  #handleDisconnected () {
    this.device = undefined
    this.characteristic = undefined
    this.isConnected = false
    this.onDisconnected?.()
  }
}

export {
  CHARACTERISTIC_UUID,
  MAX_CHUNK_BYTES,
  MAX_QR_BYTES,
  SERVICE_UUID
}
export default BLEClient
