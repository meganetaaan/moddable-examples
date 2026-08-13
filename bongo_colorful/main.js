/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

import {
  Content,
  Texture,
  Skin,
  Application
} from 'piu/MC'
import { hsl } from 'piu/All'
import Timer from 'timer'
import Sound from 'piu/Sound'
import NeoPixel from 'neopixel'
import WiFi from 'embedded:network/interface/wifi'

const np = new NeoPixel({})

function getDeviceColor () {
  const wifi = new WiFi({})
  try {
    const bytes = wifi.MAC.split(':').map(part => Number.parseInt(part, 16))
    const hue = ((bytes[3] << 8) | bytes[4]) % 360
    const lightness = 0.1 + (bytes[5] * 0.8 / 255)
    return hsl(hue, 1, lightness)
  } finally {
    wifi.close()
  }
}

const sounds = Object.freeze({
  high: new Sound({ path: 'bongo_high.wav' }),
  low: new Sound({ path: 'bongo_low.wav' }),
  meow: new Sound({ path: 'meow.wav' })
})

const deskTexture = new Texture({ path: 'desk.png' })
const DeskSkin = Skin.template({
  texture: deskTexture,
  width: 320,
  height: 240
})

const catTexture = new Texture({ path: 'cat_face.png' })
const CatSkin = Skin.template({
  texture: catTexture,
  width: 225,
  height: 130
})

const handsTexture = new Texture({ path: 'hands.png' })
const HandsSkin = Skin.template({
  texture: handsTexture,
  width: 45,
  height: 58,
  states: 58,
  variants: 45
})

const mouthTexture = new Texture({ path: 'cat_mouth.png' })
const MouthSkin = Skin.template({
  texture: mouthTexture,
  width: 28,
  height: 16,
  states: 16,
  variants: 28
})

const bongoTexture = new Texture({ path: 'bongo.png' })
const BongoSkin = Skin.template({
  texture: bongoTexture,
  width: 165,
  height: 111
})

const application = new Application(null, {
  skin: new Skin({ fill: getDeviceColor() }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  contents: [
    new Content(null, {
      top: 35,
      left: 60,
      Skin: CatSkin
    }),
    new Content(null, {
      top: 0,
      left: 0,
      Skin: DeskSkin
    }),
    new Content(null, {
      top: 115,
      left: 60,
      Skin: BongoSkin
    }),
    new Content(null, {
      name: 'rightHand',
      top: 77,
      left: 78,
      Skin: HandsSkin,
      state: 1,
      variant: 0
    }),
    new Content(null, {
      name: 'leftHand',
      top: 103,
      left: 190,
      Skin: HandsSkin,
      state: 0,
      variant: 0
    }),
    new Content(null, {
      name: 'mouth',
      top: 102,
      left: 148,
      Skin: MouthSkin,
      state: 0,
      variant: 0
    })
  ]
})

const effects = new Uint8Array(np.length).fill(1)
// M5Stack's target setup owns these pins and exposes its buttons globally.
const { a: buttonA, b: buttonB, c: buttonC } = globalThis.button

buttonA.onChanged = function () {
  const up = Boolean(this.read())
  application.content('rightHand').variant = up ? 0 : 1
  if (!up) {
    effects[0] = 1
    sounds.low.play()
  }
}

buttonB.onChanged = function () {
  const up = Boolean(this.read())
  application.content('mouth').state = up ? 0 : 1
  if (!up) {
    effects[0] = 2
    sounds.meow.play()
  }
}

buttonC.onChanged = function () {
  const up = Boolean(this.read())
  application.content('leftHand').variant = up ? 0 : 1
  if (!up) {
    effects[0] = 1
    sounds.high.play()
  }
}

const white = np.makeRGB(255, 255, 255)
const pink = np.makeRGB(255, 100, 100)
const black = np.makeRGB(0, 0, 0)
Timer.repeat(() => {
  for (let i = 0; i < np.length; i++) {
    switch (effects[i]) {
      case 1:
        np.setPixel(i, white)
        break
      case 2:
        np.setPixel(i, pink)
        break
      default:
        np.setPixel(i, black)
    }
  }
  np.update()
  effects.copyWithin(1, 0, effects.length - 1)
  effects[0] = 0
}, 1000 / 60)

export default application
