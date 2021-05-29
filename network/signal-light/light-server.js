import { Server } from 'http'
import MDNS from 'mdns'

/* global trace */

function noop() {
  // noop
}

export const Pattern = Object.freeze({
  LIT: 0,
  BLINK: 1,
  MESSAGE: 2,
})

export class Light {
  #message;
  #color;
  #pattern;
  #onChange;
  #isDirty;
  constructor({ onChange = noop }) {
    this.#message = 'light'
    this.#pattern = Pattern.LIT
    this.#color = 'red'
    this.#onChange = onChange
    this.#isDirty = false
  }
  set message(message) {
    if (this.#message !== message) {
      this.#message = message
      this.#isDirty = true
    }
  }
  get message() {
    return this.#message
  }
  set color(color) {
    if (this.#color !== color) {
      this.#color = color
      this.#isDirty = true
    }
  }
  get color() {
    return this.#color
  }
  set pattern(pattern) {
    if (this.#pattern !== pattern) {
      this.#pattern = pattern
      this.#isDirty = true
    }
  }
  get pattern() {
    return this.#pattern
  }
  sync() {
    if (this.#isDirty) {
      this.#onChange(this)
      this.#isDirty = false
    }
  }
}

export default class LightServer {
  #server
  #light
  constructor({ hostName = 'm5stack', onChange = noop }) {
    const mDNS = new MDNS({ hostName }, function (message, value) {
      if (MDNS.hostName === message) {
        hostName = value
      }
    })
    this.#light = new Light({ onChange })
    this.#server = new Server({ port: 80 })
    this.#server.callback = this.makeCallback()
  }
  makeCallback() {
    const light = this.#light
    return function callback(message, value, value2) {
      switch (message) {
        case Server.status:
          this.buf = new ArrayBuffer()
          if (value === '/' && value2 === 'GET') {
            this.body = JSON.stringify(light)
            this.needUpdate = false
          } else if (value === '/' && (value2 === 'POST' || value2 === 'PUT')) {
            this.needUpdate = true
          }
          break
        case Server.headersComplete:
          if (this.needUpdate) {
            return String
          }
          return false // ignore request body
        case Server.requestComplete:
          const reqLight = JSON.parse(value)
          const { color, pattern, message } = reqLight
          if (color != null) {
            light.color = color
          }
          if (pattern != null) {
            light.pattern = pattern
          }
          if (message != null) {
            light.message = message
          }
          light.sync()
          break;
        case Server.prepareResponse:
          const response = {
            headers: ['Content-type', 'text/plain']
          }
          response.body = this.body
          return response
      }
    }
  }
}
