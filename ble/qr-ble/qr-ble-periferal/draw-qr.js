import qrCode from 'qrcode'

const MARGIN = 10
const MAX_VERSION = 10

function drawQR (value, render) {
  let qr
  try {
    qr = qrCode({ input: value, maxVersion: MAX_VERSION })
  } catch (error) {
    trace(`Unable to generate QR code: ${error}\n`)
    return false
  }

  const available = Math.min(
    render.width - MARGIN * 2,
    render.height - MARGIN * 2
  )
  const pixels = Math.floor(available / qr.size)
  if (pixels < 1) return false

  const size = pixels * qr.size
  const x = (render.width - size) >> 1
  const y = (render.height - size) >> 1
  const white = render.makeColor(255, 255, 255)
  const black = render.makeColor(20, 20, 20)

  render.begin()
  render.fillRectangle(white, 0, 0, render.width, render.height)
  render.drawQRCode(qr, x, y, pixels, black)
  render.end()
  return true
}

export default drawQR
