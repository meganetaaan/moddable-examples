/* global */

import { Application, Style, Skin, Label, Behavior } from 'piu/MC'

// const blackSkin = new Skin({ fill: 'black' })
const StatusLabel = Label.template(($) => ({
  anchor: 'status',
  skin: new Skin({ fill: $.backgroundColor || 'white' }),
  style: new Style({
    font: 'OpenSans-Semibold-16',
    color: $.color || 'black'
  }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  string: $.message
}))

const LineThingsApplication = Application.template(($) => ({
  contents: [new StatusLabel($)],
  Behavior: class extends Behavior {
    onCreate (content, anchor) {
      content.status = anchor.status
    }
  }
}))

export default LineThingsApplication
