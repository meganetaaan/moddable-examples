/* global trace */
import { Server } from 'http'

const server = new Server({ port: 80 })

server.callback = function (message, value, value2) {
  if (Server.status === message) this.path = value

  /*
  if (message === 2) {
    trace(value)
    if (value === 'on') {
      trace('on')
    } else if (value === 'off') {
      trace('off')
    }
  }

  if (Server.prepareResponse === message) {
    return {
      headers: ['Content-type', 'text/plain'],
      body: `hello, client at path ${this.path}.`
    }
  }
  */
}
