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
import Sound from 'piu/Sound'
import Timer from 'timer'
import config from 'mc/config'

const voices = {
  connected: new Sound({ path: 'CONNECTED_01.wav' }),
  disconnected: new Sound({ path: 'DISCONNECTED_00.wav' }),
  callOne: new Sound({ path: 'DISCONNECTED_01.wav' }),
  callTwo: new Sound({ path: 'DISCONNECTED_02.wav' })
}
const parent = config.isFather
  ? new Sound({ path: 'FATHER.wav' })
  : new Sound({ path: 'MOTHER.wav' })

const FONT = 'OpenSans-Regular-20'
const BLACK = '#202020'
const WHITE = '#fafafa'

const eyesTexture = new Texture({ path: 'eyes.png' })
const eyesSkin = new Skin({
  texture: eyesTexture,
  color: BLACK,
  x: 0,
  y: 0,
  width: 192,
  height: 64
})
const mouthTexture = new Texture({ path: 'mouth.png' })
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
let count = 0

function playPhrase (message) {
  parent.play(0, 1, () => message.play())
}

new Mai5Server({
  kidID: config.kidID,
  onConnect () {
    trace('connected\n')
    if (timer !== undefined) {
      Timer.clear(timer)
      timer = undefined
    }

    application.content('face').content('mouth').variant = 1
    application.content('label').string = 'connected'
    playPhrase(voices.connected)
  },
  onDisconnect () {
    trace('disconnected\n')
    if (timer !== undefined) {
      Timer.clear(timer)
      timer = undefined
    }

    application.content('face').content('mouth').variant = 0
    application.content('label').string = 'disconnected'
    voices.disconnected.play()
    count = 0
    timer = Timer.repeat(() => {
      const message = count % 2 === 0 ? voices.callOne : voices.callTwo
      playPhrase(message)
      count++
    }, 10_000)
  }
})

export default application
