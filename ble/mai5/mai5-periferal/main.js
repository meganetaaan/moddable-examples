/* global screen, trace */
import Mai5Server from 'mai5-server'
import { Application, Style, Skin, Label, Content } from 'piu/MC'
import AudioOut from "pins/audioout"
import Resource from 'Resource'
import config from 'mc/config'

const voices = {
  CONNECTED_01: new Resource('CONNECTED_01.maud'),
  DISCONNECTED_00: new Resource('DISCONNECTED_00.maud'),
  DISCONNECTED_01: new Resource('DISCONNECTED_01.maud'),
  DISCONNECTED_02: new Resource('DISCONNECTED_02.maud')
}
const parent = config.isFather ? new Resource('FATHER.maud') : new Resource('MOTHER.maud')

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
  speaker.enqueue(0, AudioOut.Samples, parent);
  speaker.enqueue(0, AudioOut.Samples, voices.CONNECTED_01);
  speaker.enqueue(0, AudioOut.Callback, 0);
  speaker.start();
}
server.onDisconnect = () => {
  trace('disconnected\n')
  application.content('label').string = 'disconnected'
  speaker.enqueue(0, AudioOut.Samples, voices.DISCONNECTED_00);
  speaker.enqueue(0, AudioOut.Callback, 0);
  speaker.start();
}
