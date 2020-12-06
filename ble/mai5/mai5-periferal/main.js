/* global screen, trace */
import Mai5Server from 'mai5-server'
import { Application, Style, Skin, Label, Content } from 'piu/MC'
import Sound from 'piu/Sound'

const FONT = 'OpenSans-Regular-20'

const faceTexture = new Texture('face.png')
const FaceSkin = Skin.template({
  texture: faceTexture,
  width: 320,
  height: 240
})
const Mai5Face = Content.template(() => ({
  name: 'face',
  Skin: FaceSkin
}))

const Mai5Label = Label.template(() => ({
  name: 'label',
  style: new Style({ font: FONT, color: '#222' }),
  string: 'disconnected'
}))

const application = new Application(null, {
  contents: [
    new Mai5Face(null, {
      top: 0, right: 0, bottom: 0, left: 0
    }),
    new Mai5Label(null, {
      left: 0,
      bottom: 0
    })
  ]
})

const server = new Mai5Server()
server.onConnect = () => {
  trace('connected\n')
  application.content('label').string = 'connected'
}
server.onDisconnect = () => {
  trace('disconnected\n')
  application.content('label').string = 'disconnected'
}
