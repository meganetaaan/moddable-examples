import AudioOut from 'pins/audioout';
import Resource from 'Resource';
import NeoPixel from 'neopixel';
import { Request } from 'http';

const np = new NeoPixel({ length: 1, pin: 27, order: 'GRB' });
const black = np.makeRGB(0, 0, 0);
const pink = np.makeRGB(255, 127, 127);
const HOST = 'maker.ifttt.com';
const API_KEY = 'YOUR_API_KEY_HERE';
const EVENT = 'moddable_button_pressed';

const on = () => {
  np.fill(pink);
  np.update();
};
const off = () => {
  np.fill(black);
  np.update();
};
function playSound() {
  on()
  speaker.enqueue(0, AudioOut.Flush);
  speaker.enqueue(0, AudioOut.Samples, new Resource('meoow.maud'));
  speaker.enqueue(0, AudioOut.Callback, 0);
  speaker.start();
}

const triggerIFTTT = (v) => {
  let request = new Request({
    host: HOST,
    path: `/trigger/${EVENT}/with/key/${API_KEY}?value1=${v}`,
    response: String
  })
  request.callback = function (message, value) {
    if (Request.responseComplete === message) {
      trace(value);
    }
  }
}

speaker.callback = off
const buttonA = global.button.a
buttonA.onChanged = function () {
  const up = this.read();
  if (up === 0) {
    trace('play sound');
    triggerIFTTT('');
    playSound();
  }
}

on();
Time.delay(500);
off();
