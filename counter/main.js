import { Application, Style, Skin, Label } from 'piu/MC'

const FONT = 'OpenSans-Regular-52'

const application = new Application(null, {
  contents: [
    new Label(null, {
      style: new Style({ font: FONT, color: 'white' }),
      skin: new Skin({ fill: 'black' }),
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      string: '0'
    })
  ]
})

let count = 0

// M5Stack's target setup owns this pin and exposes the button globally.
globalThis.button.a.onChanged = function () {
  if (!this.read()) return

  count += 1
  trace(`${count}\n`)
  application.first.string = String(count)
}

export default application
