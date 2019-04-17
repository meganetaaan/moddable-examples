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

/* global global, Application, Skin, Label */

import {} from 'piu/MC'
import Resource from "Resource"
import AudioOut from "pins/i2s";

const sounds = {
  high: new Resource("bongo_high.maud"),
  low: new Resource("bongo_low.maud")
}

const speaker = global.speaker;
speaker.start();
let playing = {
  0: false,
  1: false
}

speaker.callback = function(stream) {
  trace(`stop: ${stream}\n`);
  playing[stream] = false;
};

function playSound(key, stream) {
  const sound = sounds[key];
  if (sound != null) {
    const speaker = global.speaker;
    if (playing[stream]) {
      trace(`interrupt: ${stream}\n`);
      return;
    }
    trace(`queue_s: ${stream}\n`);
    playing[stream] = true;
    speaker.enqueue(stream, AudioOut.Flush);
    speaker.enqueue(stream, AudioOut.Samples, sound);
    speaker.enqueue(stream, AudioOut.Callback, stream);
    trace(`queue_e: ${stream}\n`);
  }
}

const deskTexture = new Texture("desk.png");
const DeskSkin = Skin.template({
  texture:deskTexture,
  width:320,
  height:240
});

const catTexture = new Texture("cat.png");
const CatSkin = Skin.template({
  texture:catTexture,
  width:225,
  height:130
});

const handsTexture = new Texture("hands.png");
const HandsSkin = Skin.template({
  texture:handsTexture,
  width: 45,
  height: 58,
  states: 58,
  variants: 45
});

const bongoTexture = new Texture("bongo.png");
const BongoSkin = Skin.template({
  texture: bongoTexture,
  width: 165,
  height: 111
});

const label = new Label(null, {
  top: 5, left: 5,
  style: new Style({ font:"600 28px Open Sans", color: "white" }),
  string: '@meganetaaan'
});

const application = new Application(null, {
  skin: new Skin({ fill: 'blue' }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  contents: [
    new Content(null, {
      top: 35,
      left: 60,
      Skin: CatSkin
    }),
    new Content(null, {
      top: 0,
      left: 0,
      Skin: DeskSkin
    }), 
    new Content(null, {
      top: 115,
      left: 60,
      Skin: BongoSkin
    }),
    new Content(null, {
      name: 'rightHand',
      top: 77,
      left: 78,
      Skin: HandsSkin,
      state: 1,
      variant: 0
    }),
    new Content(null, {
      name: 'leftHand',
      top: 103,
      left: 190,
      Skin: HandsSkin,
      state: 0,
      variant: 0
    }),
    label
  ]
})

const buttonA = global.button.a;
const buttonC = global.button.c;
buttonA.onChanged = function() {
  const up = this.read();
  // up/down hand
  application.content('rightHand').variant = up ? 0 : 1;
  // play sound
  if(up === 0) {
    playSound('low', 0)
  }
}
buttonC.onChanged = function() {
  const up = this.read();
  // up/down hand
  application.content('leftHand').variant = up ? 0 : 1;
  // play sound
  if(up === 0) {
    playSound('high', 0)
  }
}

export default application;
