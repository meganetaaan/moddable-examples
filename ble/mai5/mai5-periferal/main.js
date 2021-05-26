/* global trace */
import Mai5Server from 'mai5-server'
import {
  Application,
  Style,
  Container,
  Skin,
  Label,
  Content,
  Texture
} from 'piu/MC'
import AudioOut from 'pins/audioout'
import Resource from 'Resource'
import Timer from 'timer'
import config from 'mc/config'

const speaker = new AudioOut({ streams: 1 })
speaker.callback = function() {
  this.stop()
}
const voices = {
  KARA_HANARENAIDENE: new Resource('KARA_HANARENAIDENE.maud'),
  MAIGO: new Resource('MAIGO.maud'),
  TTE_YONDEMITE: new Resource('TTE_YONDEMITE.maud'),
  WO_SAGASHITENE: new Resource('WO_SAGASHITENE.maud')
}
const parent = config.isFather
  ? new Resource('OTOSAN.maud')
  : new Resource('OKASAN.maud')

const FONT = 'OpenSans-Regular-20'
const BLACK = '#202020'
const WHITE = '#FAFAFA'

// const faceTexture = new Texture('face.png')
// const sadFaceTexture = new Texture('face2.png')
const eyesTexture = new Texture('eyes.png')
const eyesSkin = new Skin({
  texture: eyesTexture,
  color: BLACK,
  x: 0,
  y: 0,
  width: 192,
  height: 64
})
const mouthTexture = new Texture('mouth.png')
const mouthSkin = new Skin({
  texture: mouthTexture,
  color: BLACK,
  x: 0,
  y: 0,
  width: 48,
  height: 48,
  variants: 48
})
const Mai5Face = Container.template(() => ({
  name: 'face',
  skin: new Skin({
    fill: WHITE
  }),
  top: 0,
  left: 0,
  width: 320,
  height: 240,
  contents: [
    new Content(null, {
      name: 'eyes',
      top: 88,
      left: 64,
      width: 192,
      height: 64,
      skin: eyesSkin
    }),
    new Content(null, {
      name: 'mouth',
      top: 96,
      left: 136,
      width: 48,
      height: 48,
      skin: mouthSkin
    })
  ]
}))

const Mai5Label = Label.template(() => ({
  name: 'label',
  style: new Style({ font: FONT, color: '#222' }),
  string: 'disconnected'
}))

const application = new Application(null, {
  contents: [
    new Mai5Face(null, {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }),
    new Mai5Label(null, {
      left: 0,
      bottom: 0
    })
  ]
})

let timer
let count
const server = new Mai5Server()
server.onConnect = () => {
  trace('connected\n')
  if (timer != null) {
    Timer.clear(timer)
  }
  application.content('face').content('mouth').variant = 1 // happy face
  application.content('label').string = 'connected'
  speaker.enqueue(0, AudioOut.Samples, parent)
  speaker.enqueue(0, AudioOut.Samples, voices.KARA_HANARENAIDENE)
  speaker.enqueue(0, AudioOut.Callback, 0)
  speaker.start()
}
server.onDisconnect = () => {
  trace('disconnected\n')
  application.content('face').content('mouth').variant = 0 // sad face
  application.content('label').string = 'disconnected'
  speaker.enqueue(0, AudioOut.Samples, voices.MAIGO)
  speaker.start()
  count = 0
  timer = Timer.repeat(() => {
    const message = count % 2 === 0 ? voices.WO_SAGASHITENE : voices.TTE_YONDEMITE
    speaker.enqueue(0, AudioOut.Samples, parent)
    speaker.enqueue(0, AudioOut.Samples, message)
    speaker.enqueue(0, AudioOut.Callback, 0)
    speaker.start()
    count++
  }, 10_000)
}
