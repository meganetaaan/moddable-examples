/*
 * Copyright (c) 2021 Shinya Ishikawa
 */
import { Skin, Application, Style, Behavior } from 'piu/MC'
import WipeTransition from "piu/WipeTransition"
import MarqueeLabel from 'marquee-label'
import LightServer, { Pattern } from 'light-server'

const fluid = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

const TextStyle = Style.template({
  font: 'cg-pixel-4x5',
  color: 'green',
  horizontal: 'left'
})
const letter = 'WARNING...'

const LightSquare = Content.template((param = { color: 'white' }) => ({
  ...fluid,
  skin: new Skin({
    fill: param.color
  })
}))

class BlinkBehavior extends Behavior {
  onDisplaying(content) {
    content.start();
  }
  onTimeChanged(content) {
    content.state = content.state > 0 ? 0 : 1;
  }
}

const LightBlinkSquare = Content.template((param = { color: 'white' }) => ({
  ...fluid,
  skin: new Skin({
    fill: [param.color, 'black']
  }),
  Behavior: BlinkBehavior,
  duration: 1000,
  interval: 500,
  loop: true
}))

const LightLabel = MarqueeLabel.template($ => ({
  ...fluid,
  style: new Style({
    font: 'cg-pixel-4x5',
    horizontal: 'left',
    color: $.color
  }),
  string: $.string
}))

let LoveApplication = Application.template((_) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  skin: new Skin({
    fill: 'black'
  }),
  contents: [
    new LightLabel({ color: 'white', string: 'light-server' })
  ]
}))

export default function () {
  const ap = new LoveApplication(null, {
    pixels: 25,
    displayListLength: 4096 * 10,
    touchCount: 0
  })
  const handleLightChange = (light) => {
    let next, transition
    switch (light.pattern) {
      case Pattern.LIT:
        next = new LightSquare({
          color: light.color
        })
        transition = new WipeTransition(250, Math.quadEaseOut, 'right')
        ap.run(transition, ap.first, next);
        break;
      case Pattern.BLINK: // TODO: implement blink
        next = new LightBlinkSquare({
          color: light.color
        })
        transition = new WipeTransition(250, Math.quadEaseOut, 'right')
        ap.run(transition, ap.first, next);
        break;
      case Pattern.MESSAGE:
        next = new LightLabel({
          color: light.color,
          string: light.message
        })
        // next = getLightLabel(light.color, light.message)
        transition = new WipeTransition(250, Math.quadEaseOut, 'right')
        ap.run(transition, ap.first, next);
        break;
    }
  }
  const server = new LightServer({
    onChange: handleLightChange
  })
}
