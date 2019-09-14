import { Server } from 'http'
import NeoPixel from 'neopixel'
import MDNS from 'mdns'

/* global trace */

const neoPixel = new NeoPixel({ length: 60, pin: 21, order: 'RGB' })

let hostName = 'm5stack'
const mDNS = new MDNS({ hostName }, function (message, value) {
  if (MDNS.hostName === message) {
    hostName = value
  }
})
trace(mDNS)

const server = new Server({ port: 80 })
server.callback = function (message, value, value2) {
  if (message === 2) {
    if (value === '/on' && value2 === 'GET') {
      this.status = 'on'
      neoPixel.fill(neoPixel.makeRGB(255, 255, 255))
      neoPixel.update()
    } else if (value === '/off' && value2 === 'GET') {
      this.status = 'off'
      neoPixel.fill(neoPixel.makeRGB(0, 0, 0))
      neoPixel.update()
    }
  }

  if (Server.prepareResponse === message) {
    const response = {
      headers: ['Content-type', 'text/plain']
    }
    if (this.status === 'on') {
      response.body = 'The light is on'
    } else if (this.status === 'off') {
      response.body = 'The light is off'
    } else {
      response.body = 'no content'
    }
    return response
  }
}
