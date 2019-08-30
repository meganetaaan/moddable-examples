import {
  Content,
  Texture,
  Skin,
  Application
} from 'piu/MC'
import WipeTransition from 'piu/WipeTransition'

const jsTexture = new Texture('js-logo.png')
const JSSkin = Skin.template({
  texture: jsTexture,
  width: 240,
  height: 240
})

const moddableTexture = new Texture('moddable-logo.png')
const ModdableSkin = Skin.template({
  texture: moddableTexture,
  color: ['blue', 'white'],
  width: 240,
  height: 60
})

const application = new Application(null, {
  skin: new Skin({ fill: '#F0DB4F' }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  contents: [
    new Content(null, {
      bottom: 0,
      right: 0,
      Skin: JSSkin
    })
  ]
})

let mode = 0

global.button.a.onChanged = function () {
  if (this.read()) {
    mode = (mode + 1) % 2
    const content = new Content(null, {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      Skin: mode === 0 ? JSSkin : ModdableSkin
    })
    const transition = new WipeTransition(
      250,
      Math.quadEaseOut,
      'center',
      'middle'
    )
    const color = mode === 0 ? '#F0DB4F' : 'white'
    application.skin = new Skin({ fill: color })
    application.run(
      transition,
      application.first,
      content
    )
  }
}

export default application
