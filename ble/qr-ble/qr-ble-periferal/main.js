import createQRServer from 'qr-server'
import drawQR from 'draw-qr'
import Poco from 'commodetto/Poco'

globalThis.power?.setBrightness(8)

const render = new Poco(screen)

const gray = render.makeColor(128, 128, 128)
render.begin()
render.fillRectangle(gray, 0, 0, render.width, render.height)
render.end()

createQRServer({
  onQRChange (qr) {
    drawQR(qr, render)
  }
})
