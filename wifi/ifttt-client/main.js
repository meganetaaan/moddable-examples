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

/* global trace, button */

import { Request } from 'http'

const HOST = 'maker.ifttt.com'
const API_KEY = 'YOUR_API_KEY_HERE'
const EVENT = 'button_pressed'

const triggerIFTTT = () => {
  let request = new Request({
    host: HOST,
    path: `/trigger/${EVENT}/with/key/${API_KEY}`,
    response: String
  })
  request.callback = function (message, value) {
    if (Request.responseComplete === message) {
      trace(value)
    }
  }
}

button.a.onChange = function () {
  const v = this.read()
  if (v) {
    triggerIFTTT()
  }
}
