import TextDecoder from 'text/decoder'

const DEFAULT_MAX_BYTES = 64 * 1024

export default function requestText (network, options) {
  const { host, maxBytes = DEFAULT_MAX_BYTES, ...requestOptions } = options

  return new Promise((resolve, reject) => {
    let client
    let settled = false
    let status
    const bytes = new Uint8Array(new ArrayBuffer(0, {
      maxByteLength: maxBytes
    }))

    const finish = (error, value) => {
      if (settled) return

      settled = true
      const current = client
      client = undefined
      current?.close()

      if (error) reject(error)
      else resolve(value)
    }

    try {
      client = new network.io({
        ...network,
        host,
        onError (error) {
          finish(error ?? new Error('Network error'))
        }
      })
      client.request({
        ...requestOptions,
        onHeaders (value) {
          status = value
        },
        onReadable (count) {
          const length = bytes.byteLength
          if (count > maxBytes - length) {
            finish(new RangeError(`HTTP response exceeds ${maxBytes} bytes`))
            return
          }

          bytes.buffer.resize(length + count)
          this.read(bytes.subarray(length))
        },
        onDone (error) {
          if (error) {
            finish(error)
            return
          }

          const body = new TextDecoder().decode(bytes)

          if (!Number.isInteger(status)) {
            finish(new Error('HTTP response has no status'))
          } else if (status < 200 || status >= 300) {
            const responseError = new Error(`HTTP ${status}`)
            responseError.status = status
            responseError.body = body
            finish(responseError)
          } else {
            finish(undefined, body)
          }
        }
      })
    } catch (error) {
      finish(error)
    }
  })
}
