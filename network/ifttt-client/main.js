import config from 'mc/config'
import requestText from 'http-client'
import { hasIFTTTKey, makeIFTTTPath } from 'ifttt'

const HOST = 'maker.ifttt.com'
let sending = false

async function triggerIFTTT (value) {
  if (sending) return
  if (!hasIFTTTKey(config.iftttKey)) {
    trace('Set config.iftttKey before sending a webhook\n')
    return
  }

  sending = true
  try {
    const response = await requestText(device.network.https, {
      host: HOST,
      path: makeIFTTTPath({
        event: config.iftttEvent,
        key: config.iftttKey,
        value
      })
    })
    trace(`${response}\n`)
  } catch (error) {
    trace(`IFTTT request failed: ${error}\n`)
  } finally {
    sending = false
  }
}

// M5Stack's target setup owns these pins and exposes its buttons globally.
globalThis.button.a.onChanged = function () {
  if (this.read()) triggerIFTTT('a')
}

globalThis.button.b.onChanged = function () {
  if (this.read()) triggerIFTTT('b')
}
