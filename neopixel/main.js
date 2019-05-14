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

/* global lights */

const blue = lights.makeRGB(0, 0, 255)
const white = lights.makeRGB(255, 255, 255)
for (let i = 0; i < lights.length; i++) {
  lights.setPixel(i, i & 1 ? white : blue)
}
lights.update()
