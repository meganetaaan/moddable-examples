/* global trace, button */

import { Request } from 'http'

const HOST = 'maker.ifttt.com'
const API_KEY = 'YOUR_API_KEY_HERE'
const EVENT = 'button_pressed'

const triggerIFTTT = () => {
  let request = new Request({
    host: HOST,
    path: `/trigger/${EVENT}/with/key/${API_KEY}`,
    response: String
  })
  request.callback = function (message, value) {
    if (Request.responseComplete === message) {
      trace(value)
    }
  }
}

button.a.onChange = function () {
  const v = this.read()
  if (v) {
    triggerIFTTT()
  }
}
