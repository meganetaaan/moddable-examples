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
import Sound from 'piu/Sound'
import getDeviceUniqueColor from 'getDeviceUniqueColor'

const deviceColor = getDeviceUniqueColor()

const sounds = {
  high: new Sound({ path: 'bongo_high.wav' }),
  low: new Sound({ path: 'bongo_low.wav' }),
  meow: new Sound({ path: 'meow.wav' })
}

function playSound (key) {
  const sound = sounds[key]
  if (sound != null) {
    sound.play()
  }
}

const deskTexture = new Texture('desk.png')
const DeskSkin = Skin.template({
  texture: deskTexture,
  width: 320,
  height: 240
})

const catTexture = new Texture('cat_face.png')
const CatSkin = Skin.template({
  texture: catTexture,
  width: 225,
  height: 130
})

const handsTexture = new Texture('hands.png')
const HandsSkin = Skin.template({
  texture: handsTexture,
  width: 45,
  height: 58,
  states: 58,
  variants: 45
})

const mouthTexture = new Texture('cat_mouth.png')
const MouthSkin = Skin.template({
  texture: mouthTexture,
  width: 28,
  height: 16,
  states: 16,
  variants: 28
})

const bongoTexture = new Texture('bongo.png')
const BongoSkin = Skin.template({
  texture: bongoTexture,
  width: 165,
  height: 111
})

const application = new Application(null, {
  // skin: new Skin({ fill: 'blue' }),
  skin: new Skin({ fill: deviceColor }),
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

const buttonA = global.button.a
const buttonB = global.button.b
const buttonC = global.button.c
buttonA.onChanged = function () {
  const up = this.read()
  // up/down hand
  application.content('rightHand').variant = up ? 0 : 1
  // play sound
  if (up === 0) {
    playSound('low')
  }
}
buttonB.onChanged = function () {
  const up = this.read()
  application.content('mouth').state = up ? 0 : 1
  if (up === 0) {
    playSound('meow')
  }
}
buttonC.onChanged = function () {
  const up = this.read()
  // up/down hand
  application.content('leftHand').variant = up ? 0 : 1
  // play sound
  if (up === 0) {
    playSound('high')
  }
}

export default application
