export const KEYS = [
  [0, 0x10, 0, 261],
  [0, 0x20, 1, 277],
  [0, 0x40, 2, 293],
  [1, 0x01, 3, 311],
  [1, 0x02, 4, 329],
  [2, 0x04, 6, 349],
  [2, 0x08, 7, 370],
  [2, 0x10, 8, 392],
  [0, 0x01, 9, 415],
  [0, 0x02, 10, 440],
  [0, 0x04, 11, 466],
  [0, 0x08, 12, 494],
  [3, 0x10, 14, 524],
  [3, 0x20, 15, 554],
  [3, 0x40, 16, 588],
  [4, 0x01, 17, 622],
  [4, 0x02, 18, 660],
  [5, 0x02, 20, 698],
  [5, 0x04, 21, 740],
  [5, 0x08, 22, 784],
  [5, 0x10, 23, 831],
  [3, 0x01, 24, 880],
  [3, 0x02, 25, 932],
  [3, 0x04, 26, 988],
  [3, 0x08, 27, 1048]
]

export function decodeKeys (bytes) {
  let pressed = 0
  for (let index = 0; index < KEYS.length; index += 1) {
    const [byte, mask] = KEYS[index]
    if (bytes[byte] & mask) pressed |= 1 << index
  }
  return pressed
}

export function makeSineWave (frequency, sampleRate) {
  const samples = Math.round(sampleRate / frequency)
  const wave = new Int16Array(new SharedArrayBuffer(samples * Int16Array.BYTES_PER_ELEMENT))
  const step = 2 * Math.PI / wave.length
  for (let index = 0; index < wave.length; index += 1) {
    wave[index] = Math.round(Math.sin(index * step) * 32767)
  }
  return wave.buffer
}

export function assignVoices (voices, pressed) {
  const next = voices.map(key => (
    key >= 0 && (pressed & (1 << key)) ? key : -1
  ))
  for (let key = 0; key < KEYS.length; key += 1) {
    if (!(pressed & (1 << key)) || next.includes(key)) continue

    const stream = next.indexOf(-1)
    if (stream < 0) break
    next[stream] = key
  }
  return next
}

export function initializeTS20 (sensor, sensitivity = 5) {
  if (!Number.isInteger(sensitivity) || sensitivity < 0 || sensitivity > 15) {
    throw new RangeError('TS20 sensitivity must be an integer from 0 to 15')
  }

  sensor.writeUint8(0x0c, 0x1a)
  for (let register = 0x0e; register <= 0x13; register += 1) {
    sensor.writeUint8(register, 0)
  }
  for (let register = 0; register <= 0x0a; register += 1) {
    const value = register === 3
      ? 0xf0 | sensitivity
      : sensitivity * 0x11
    sensor.writeUint8(register, value)
  }
  sensor.writeUint8(0x0b, 0x4b)
  for (let register = 0x14; register <= 0x16; register += 1) {
    sensor.writeUint8(register, 0)
  }
  sensor.writeUint8(0x17, 0x0d)
  sensor.writeUint8(0x0d, 0xfa)
  sensor.writeUint8(0x0c, 0x12)
}
