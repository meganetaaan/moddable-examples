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
import { Skin, Application, Text, Style, Texture, Content } from 'piu/MC'

const TextStyle = Style.template({
  font: 'Houstiny',
  color: 'red',
  horizontal: 'left'
})

const quick = 'The quick brown fox jumps over the lazy dog'
const dogTexture = new Texture({ path: 'dog.png' })
const dogSkin = new Skin({ texture: dogTexture, color: ['black', 'white'], x: 0, y: 0, width: 196, height: 150 })

const EInkApplication = Application.template(() => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  skin: new Skin({
    fill: 'white'
  }),
  contents: [
    new Content(null, { bottom: 0,
      left: 0,
      skin: dogSkin
    }),
    new Text(null, {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      Style: TextStyle,
      string: quick
    })
  ]
}))

export default function () {
  return new EInkApplication(null, { displayListLength: 4096 * 10, touchCount: 0 })
}
