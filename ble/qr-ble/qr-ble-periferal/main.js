/* global screen */

import QRServer from 'qr-server'
import drawQR from 'draw-qr'
import Poco from 'commodetto/Poco'

// set brightness
if (global.power != null) {
  global.power.setBrightness(8)
}

const render = new Poco(screen)

const gray = render.makeColor(128, 128, 128)
render.fillRectangle(gray, 0, 0, render.width, render.height)

const qrServer = new QRServer()
qrServer.onQRChange = qr => {
  drawQR(qr, render)
}
