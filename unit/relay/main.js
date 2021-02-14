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

import Digital from 'pins/digital'
import Timer from 'timer'
import { Application, Label, Image, Style, Skin } from 'piu/MC'

const ap = new Application(null, {
  skin: new Skin({
    fill: "white",
  }),
  contents: [
    new Label(null, {
      name: "label",
      top: 60,
      right: 0,
      left: 0,
      vertical: "top",
      style: new Style({
        font: "OpenSans-Semibold-20",
        color: ["red", "black"],
      }),
      string: "A HAPPY NEW YEAR 2021!!",
    }),
    new Image(null, {
      name: 'parrot',
      bottom: 0,
      left: 0,
      path: "fastparrot.cs",
      loop: true,
    }),
  ],
});

let on = false;
Timer.repeat(() => {
  on = !on;
  if (on) {
    trace("on\n");
    ap.content("label").state = 0;
    ap.content("parrot").start()
    Digital.write(21, 1);
  } else {
    trace("off\n");
    ap.content("label").state = 1;
    ap.content("parrot").stop()
    Digital.write(21, 0);
  }
}, 3000);
