import {
  Content,
  Texture,
  Skin,
  Application
} from 'piu/MC'
import WipeTransition from 'piu/WipeTransition'

const jsTexture = new Texture({ path: 'js-logo.png' })
const JSSkin = Skin.template({
  texture: jsTexture,
  width: 240,
  height: 240
})

const moddableTexture = new Texture({ path: 'moddable-logo.png' })
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

let showModdable = false

// M5Stack's target setup owns this pin and exposes the button globally.
globalThis.button.a.onChanged = function () {
  if (!this.read()) return

  showModdable = !showModdable
  const content = new Content(null, {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    Skin: showModdable ? ModdableSkin : JSSkin
  })
  const transition = new WipeTransition(
    250,
    Math.quadEaseOut,
    'center',
    'middle'
  )
  application.skin = new Skin({ fill: showModdable ? 'white' : '#F0DB4F' })
  application.run(transition, application.first, content)
}

export default application
