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

/* global button */

import { NeoStrand, NeoStrandEffect } from 'neostrand'

const TIMING_WS2812B = {
  mark: { level0: 1, duration0: 900, level1: 0, duration1: 350 },
  space: { level0: 1, duration0: 350, level1: 0, duration1: 900 },
  reset: { level0: 0, duration0: 100, level1: 0, duration1: 100 }
}

const LEN = 29
const strand = new NeoStrand({
  length: LEN,
  pin: 32, // for M5StickC
  order: 'RGB',
  timing: TIMING_WS2812B
})

let myEffect = new NeoStrand.HueSpan({
  strand,
  start: 0,
  end: strand.length / 2 - 1
})
let myEffect2 = new NeoStrand.Marquee({
  strand,
  start: strand.length / 2,
  end: strand.length,
  reverse: 1
})

let myScheme = [myEffect, myEffect2]

strand.setScheme(myScheme)
strand.start(50)

let manySchemes = [
  myScheme,
  [new NeoStrand.HueSpan({ strand })],
  [new NeoStrand.Marquee({ strand })]
]
let currentScheme = 0

button.a.onChanged = function () {
  if (this.read() === 1) {
    currentScheme = (currentScheme + 1) % manySchemes.length
    strand.setScheme(manySchemes[currentScheme])
  }
}

class RandomColor extends NeoStrandEffect {
  constructor (dictionary) {
    super(dictionary)
    this.name = 'RandomColor'
    this.size = dictionary.size ? dictionary.size : 15
    this.max = dictionary.max ? dictionary.max : 127
    this.loop = 1 // force loop
  }
  loopPrepare (effect) {
    effect.colors_set = 0
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
  set effectValue (value) {
    if (this.colors_set === 0) {
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
      this.colors_set = 1
    }
  }
}

let randomColorScheme = [new RandomColor({ strand })]
manySchemes.push(randomColorScheme)
