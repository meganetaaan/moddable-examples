/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <https://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

import Timer from 'timer'
import { Application, Label, Image, Style, Skin } from 'piu/MC'

const Digital = device.io.Digital
const relay = new Digital({
  pin: 21,
  mode: Digital.Output,
  initialValue: 0
})

const application = new Application(null, {
  skin: new Skin({
    fill: 'white'
  }),
  contents: [
    new Label(null, {
      name: 'label',
      top: 60,
      right: 0,
      left: 0,
      vertical: 'top',
      style: new Style({
        font: 'OpenSans-Semibold-20',
        color: ['red', 'black']
      }),
      string: 'A HAPPY NEW YEAR 2021!!'
    }),
    new Image(null, {
      name: 'parrot',
      bottom: 0,
      left: 0,
      path: 'fastparrot.cs',
      loop: true
    })
  ]
})

const label = application.content('label')
const parrot = application.content('parrot')

let on = false
Timer.repeat(() => {
  on = !on
  label.state = on ? 0 : 1
  if (on) {
    trace('on\n')
    parrot.start()
  } else {
    trace('off\n')
    parrot.stop()
  }
  relay.write(on ? 1 : 0)
}, 3000)
