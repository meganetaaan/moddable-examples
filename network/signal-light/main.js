/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
import { Skin, Application, Style } from 'piu/MC'
import MarqueeLabel from 'marquee-label'
import LightServer from 'light-server'

const server = new LightServer({})
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

let LoveApplication = Application.template((_) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  skin: new Skin({
    fill: 'black'
  }),
  contents: [
    new MarqueeLabel({
      ...fluid,
      Style: TextStyle,
      string: letter
    })
  ]
}))

export default function () {
  /* eslint-disable no-new */
  new LoveApplication(null, {
    pixels: 25,
    // pixels: 256,
    displayListLength: 4096 * 10,
    touchCount: 0
  })
}
