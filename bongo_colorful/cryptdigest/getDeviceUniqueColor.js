import { Digest } from 'crypt'
import { hsl } from 'piu/All'
import getMacAddress from 'mac-address'

/* global trace */

let sha1 = new Digest('SHA1')
sha1.write(getMacAddress())
const arr = sha1.close()
const dv = new DataView(arr, 0, 1)
const dv2 = new DataView(arr, 1, 1)

trace(dv.getUint8(0) + '\n')
trace(dv2.getUint8(0) + '\n')

const color = hsl(dv.getUint8(0) * 360 / 255, 1, 0.1 + (dv2.getUint8(0) * 0.8 / 255))

function getDeviceUniqueColor () {
  return color
}

export default getDeviceUniqueColor
