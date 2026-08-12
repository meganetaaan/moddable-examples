/*
 * Copyright (c) 2018  Moddable Tech, Inc.
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

import config from 'mc/config'
import Digital from 'embedded:io/digital'
import { NeoStrand, NeoStrandEffect } from 'neostrand'

const TIMING_WS2812B = {
  mark: { level0: 1, duration0: 900, level1: 0, duration1: 350 },
  space: { level0: 1, duration0: 350, level1: 0, duration1: 900 },
  reset: { level0: 0, duration0: 100, level1: 0, duration1: 100 }
}

const { length, pin, order, brightness } = config.strand
const strand = new NeoStrand({
  length,
  pin,
  order,
  timing: TIMING_WS2812B
})
strand.brightness = brightness

const midpoint = Math.floor(strand.length / 2)
const firstEffect = new NeoStrand.HueSpan({
  strand,
  start: 0,
  end: midpoint
})
const secondEffect = new NeoStrand.Marquee({
  strand,
  start: midpoint,
  end: strand.length,
  reverse: 1
})

const initialScheme = [firstEffect, secondEffect]

strand.setScheme(initialScheme)
strand.start(50)

const schemes = [
  initialScheme,
  [new NeoStrand.HueSpan({ strand })],
  [new NeoStrand.Marquee({ strand })]
]
let currentScheme = 0

class RandomColor extends NeoStrandEffect {
  constructor (dictionary) {
    super(dictionary)
    this.name = 'RandomColor'
    this.size = dictionary.size ?? 15
    this.max = dictionary.max ?? 127
    this.loop = 1 // force loop
  }
  loopPrepare (effect) {
    effect.colorsSet = 0
  }
  activate (effect) {
    effect.timeline.on(
      effect,
      { effectValue: [0, effect.dur] },
      effect.dur,
      null,
      0
    )
    effect.reset(effect)
  }
  set effectValue (_value) {
    if (this.colorsSet === 0) {
      for (let i = this.start; i < this.end; i++) {
        if (i % this.size === 0) {
          this.color = this.strand.makeRGB(
            Math.random() * this.max,
            Math.random() * this.max,
            Math.random() * this.max
          )
        }
        this.strand.set(i, this.color, this.start, this.end)
      }
      this.colorsSet = 1
    }
  }
}

schemes.push([new RandomColor({ strand })])

let lastPress = 0
new Digital({
  pin: config.button.pin,
  mode: Digital.InputPullUp,
  edge: Digital.Falling,
  onReadable () {
    const now = Date.now()
    if ((now - lastPress) < 125) return

    lastPress = now
    currentScheme = (currentScheme + 1) % schemes.length
    strand.setScheme(schemes[currentScheme])
  }
})
