import {
  Content,
  Texture,
  Skin,
  Application
} from 'piu/MC'

const jsTexture = new Texture('js-logo-small.png')
const JSSkin = Skin.template({
  texture: jsTexture,
  width: 240,
  height: 240
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

export default application
