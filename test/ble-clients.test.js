import assert from 'node:assert/strict'
import test from 'node:test'

import Mai5BLEClient, {
  SERVICE_UUID as MAI5_SERVICE_UUID
} from '../ble/mai5/mai5-central/src/js/BLEClient.js'
import QRBLEClient, {
  CHARACTERISTIC_UUID as QR_CHARACTERISTIC_UUID,
  MAX_CHUNK_BYTES,
  MAX_QR_BYTES,
  SERVICE_UUID as QR_SERVICE_UUID
} from '../ble/qr-ble/central/src/js/BLEClient.js'
import QRMessageBuffer from '../ble/qr-ble/qr-ble-periferal/qr-message.js'

function createBluetoothMock ({ characteristic } = {}) {
  let disconnectHandler
  let requestedCharacteristic
  let requestedOptions
  let requestedService

  const service = {
    async getCharacteristic (uuid) {
      requestedCharacteristic = uuid
      return characteristic
    }
  }
  const gattServer = {
    async getPrimaryService (uuid) {
      requestedService = uuid
      return service
    }
  }
  const device = {
    gatt: {
      async connect () {
        return gattServer
      },
      disconnect () {}
    },
    addEventListener (name, callback) {
      if (name === 'gattserverdisconnected') disconnectHandler = callback
    }
  }
  const bluetooth = {
    async requestDevice (options) {
      requestedOptions = options
      return device
    }
  }

  return {
    bluetooth,
    disconnect: () => disconnectHandler(),
    inspect () {
      return { requestedCharacteristic, requestedOptions, requestedService }
    }
  }
}

test('Mai5 Web Bluetooth client connects by service and tracks disconnects', async () => {
  const mock = createBluetoothMock()
  const client = new Mai5BLEClient(mock.bluetooth)
  let connected = 0
  let disconnected = 0
  client.onConnected = () => connected++
  client.onDisconnected = () => disconnected++

  await client.connect()

  assert.equal(client.isConnected, true)
  assert.equal(connected, 1)
  assert.deepEqual(mock.inspect().requestedOptions, {
    filters: [{ services: [MAI5_SERVICE_UUID] }]
  })
  assert.equal(mock.inspect().requestedService, MAI5_SERVICE_UUID)

  mock.disconnect()
  assert.equal(client.isConnected, false)
  assert.equal(disconnected, 1)
})

test('QR Web Bluetooth client writes bounded UTF-8 chunks with responses', async () => {
  const writes = []
  const characteristic = {
    async writeValueWithResponse (value) {
      writes.push(Uint8Array.from(value))
    }
  }
  const mock = createBluetoothMock({
    characteristic
  })
  const client = new QRBLEClient(mock.bluetooth)
  await client.connect()

  assert.deepEqual(mock.inspect().requestedOptions, {
    filters: [{ services: [QR_SERVICE_UUID] }]
  })
  assert.equal(mock.inspect().requestedService, QR_SERVICE_UUID)
  assert.equal(mock.inspect().requestedCharacteristic, QR_CHARACTERISTIC_UUID)

  const text = 'Moddableを表示🙂Moddableを表示🙂'
  await client.sendText(text)

  assert.ok(writes.length > 2)
  assert.deepEqual(writes.at(-1), Uint8Array.of(0x0d))
  for (const chunk of writes.slice(0, -1)) {
    assert.ok(chunk.byteLength <= MAX_CHUNK_BYTES)
  }
  const payload = Uint8Array.from(writes.slice(0, -1).flatMap(chunk => [...chunk]))
  assert.equal(new TextDecoder().decode(payload), text)

  await assert.rejects(
    client.sendText('é'.repeat(MAX_QR_BYTES)),
    /at most 200 UTF-8 bytes/
  )
  await assert.rejects(client.sendText('line\rbreak'), /carriage return/)
})

test('QR message buffer joins split UTF-8 and resets after overflow', () => {
  const completed = []
  const messages = new QRMessageBuffer({
    maxBytes: 12,
    onMessage: buffer => completed.push(buffer)
  })
  const encoded = new TextEncoder().encode('日本語')

  assert.equal(messages.write(encoded.subarray(0, 4)), true)
  assert.equal(messages.write(encoded.subarray(4)), true)
  assert.equal(messages.write(Uint8Array.of(0x0d)), true)
  assert.equal(new TextDecoder().decode(completed[0]), '日本語')

  assert.equal(messages.write(new Uint8Array(13)), false)
  assert.equal(messages.write(Uint8Array.of(0x41, 0x0d)), true)
  assert.equal(new TextDecoder().decode(completed[1]), 'A')
})
