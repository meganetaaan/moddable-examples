import { Application, Style, Skin, Label } from 'piu/MC'

const FONT = 'OpenSans-Semibold-16'

const application = new Application({
  contents: [
    new Label({
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

const counts = {
  a: 0
}

function countup (button) {
  counts[button] += 1
  application.first.string = counts[button]
}

global.button.a.onChanged = function () {
  const v = this.read()
  if (v) {
    countup('a')
  }
}
