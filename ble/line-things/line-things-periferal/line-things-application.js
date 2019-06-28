/* global */

import { Application, Style, Skin, Label } from 'piu/MC'

const whiteSkin = new Skin({ fill: 'white' })
// const blackSkin = new Skin({ fill: 'black' })
const textStyle = new Style({
  font: 'OpenSans-Semibold-16',
  color: 'black'
})
const LineThingsApplication = Application.template($ => ({
  contents: [
    new Label(null, {
      skin: whiteSkin,
      style: textStyle,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      string: $.string
    })
  ]
}))

export default LineThingsApplication
