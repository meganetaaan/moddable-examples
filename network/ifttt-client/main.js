/* global trace, button */

import { Request } from 'http'

const HOST = 'maker.ifttt.com'
const API_KEY = 'YOUR_API_KEY_HERE'
const EVENT = 'moddable_button_pressed'

const triggerIFTTT = (v) => {
  let request = new Request({
    host: HOST,
    path: `/trigger/${EVENT}/with/key/${API_KEY}?value1=${v}`,
    response: String
  })
  request.callback = function (message, value) {
    if (Request.responseComplete === message) {
      trace(value)
    }
  }
}

button.a.onChanged = function () {
  const v = this.read()
  if (v) {
    triggerIFTTT('a')
  }
}
button.b.onChanged = function () {
  const v = this.read()
  if (v) {
    triggerIFTTT('b')
  }
}
