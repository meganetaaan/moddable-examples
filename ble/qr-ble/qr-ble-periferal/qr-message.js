class QRMessageBuffer {
  #bytes = []
  #maxBytes
  #onMessage

  constructor ({ maxBytes, onMessage }) {
    this.#maxBytes = maxBytes
    this.#onMessage = onMessage
  }

  reset () {
    this.#bytes.length = 0
  }

  write (buffer) {
    const bytes = ArrayBuffer.isView(buffer)
      ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new Uint8Array(buffer)

    for (const byte of bytes) {
      if (byte === 0x0d) {
        if (this.#bytes.length) {
          this.#onMessage(Uint8Array.from(this.#bytes).buffer)
          this.reset()
        }
        continue
      }

      if (this.#bytes.length >= this.#maxBytes) {
        this.reset()
        return false
      }
      this.#bytes.push(byte)
    }
    return true
  }
}

export default QRMessageBuffer
