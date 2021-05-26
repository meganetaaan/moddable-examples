import { Server } from 'http'
import MDNS from 'mdns'

/* global trace */

export const Pattern = Object.freeze({
  LIT: 0,
  BLINK: 1,
  MESSAGE: 2,
})

export class Light {
  message;
  color;
  pattern;
  constructor() {
    this.message = ''
    this.pattern = Pattern.LIT
    this.color = 'red'
  }
}

export default class LightServer {
  #server
  #light
  constructor({ hostName = 'm5stack' }) {
    const mDNS = new MDNS({ hostName }, function (message, value) {
      if (MDNS.hostName === message) {
        hostName = value
      }
    })
    this.#light = new Light()
    this.#server = new Server({ port: 80 })
    this.#server.callback = this.makeCallback()
  }
  makeCallback() {
    const light = this.#light
    return function callback(message, value, value2) {
      if (Server.status === message) {
        if (value === '/' && value2 === 'GET') {
          this.body = JSON.stringify(light)
          this.needUpdate = false
        } else if (value === '/' && (value2 === 'POST' || value2 === 'PUT')) {
          this.needUpdate = true
        }
      }
      if (Server.prepareResponse === message) {
        const response = {
          headers: ['Content-type', 'text/plain']
        }
        response.body = this.body
        return response
      }
    }
  }
}
