import {
  Content,
  Texture,
  Skin,
  Application
} from 'piu/MC'
import Sound from 'piu/Sound'

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
  skin: new Skin({ fill: 'blue' }),
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

// M5Stack's target setup owns these pins and exposes its buttons globally.
const { a: buttonA, b: buttonB, c: buttonC } = globalThis.button

buttonA.onChanged = function () {
  const up = Boolean(this.read())
  application.content('rightHand').variant = up ? 0 : 1
  if (!up) sounds.low.play()
}

buttonB.onChanged = function () {
  const up = Boolean(this.read())
  application.content('mouth').state = up ? 0 : 1
  if (!up) sounds.meow.play()
}

buttonC.onChanged = function () {
  const up = Boolean(this.read())
  application.content('leftHand').variant = up ? 0 : 1
  if (!up) sounds.high.play()
}

export default application
