import HTTPServer from 'embedded:network/http/server'
import Listener from 'embedded:io/socket/listener'
import WebPage from 'embedded:network/http/server/options/webpage'
import NeoPixel from 'neopixel'
import config from 'mc/config'

const light = new NeoPixel({})
const off = light.makeRGB(0, 0, 0)
const on = light.makeRGB(255, 255, 255)

function setLight (enabled) {
  light.fill(enabled ? on : off)
  light.update()
}

function page (data, status = 200, headers) {
  return {
    ...WebPage,
    data: `${data}\n`,
    status,
    contentType: 'text/plain',
    headers
  }
}

const lightOn = page('The light is on')
const lightOff = page('The light is off')
const notFound = page('Not found', 404)
const methodNotAllowed = page(
  'Method not allowed',
  405,
  new Map([['allow', 'GET']])
)

setLight(false)

const server = new HTTPServer({
  io: Listener,
  port: 80,
  onConnect (connection) {
    connection.accept({
      onRequest (request) {
        if (request.method !== 'GET') {
          this.route = methodNotAllowed
          return
        }

        const path = request.path.split('?', 1)[0]
        if (path === '/on') {
          setLight(true)
          this.route = lightOn
        } else if (path === '/off') {
          setLight(false)
          this.route = lightOff
        } else {
          this.route = notFound
        }
      }
    })
  }
})

const dnssd = new device.network.dnssd.io(device.network.dnssd)
dnssd.claim({
  host: config.lightHostName,
  onReady () {
    dnssd.advertise({
      serviceType: '_http._tcp',
      name: 'M5Stack Light',
      host: config.lightHostName,
      port: server.port,
      txt: new Map([['path', '/on']])
    })
    trace(`Light server ready at http://${config.lightHostName}.local/\n`)
  },
  onError () {
    trace(`Could not claim ${config.lightHostName}.local\n`)
  }
})
