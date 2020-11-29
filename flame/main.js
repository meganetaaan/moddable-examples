/*
 * Copyright (c) 2018  Moddable Tech, Inc.
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
import NeoPixel from "neopixel";
import Timer from "timer";
import Digital from "pins/digital";
import Monitor from "pins/digital/monitor";

const np = new NeoPixel({length: 8 * 8, pin: 25, order: "GRB"});
np.brightness = 64
const COOLING = 12

class Flame {
	constructor(width, height, np) {
		this.width = width
		this.height = height
		this.heat = new Uint8Array(width * height)
		this.hue = 15
		this.np = np
	}

	index(x, y) {
		return this.width * y + x;
	}

	update() {
		let cooldown, i, j, x, l, pre;
		l = this.width * this.height

		// copy and cooldown
		for (i = this.height - 1; i > 0; i--) {
			for (j = 0; j < this.width; j++) {
				x = this.index(j, i)
				cooldown = Math.random() * COOLING + COOLING
				pre = this.heat[this.index(j, i - 1)]
				if (cooldown > pre) {
					this.heat[x] = 0
				} else {
					this.heat[x] = pre - cooldown
				}
			}
		}

		// SPARKING
		for (j = 0; j < this.width; j++) {
			x = this.index(j, 0)
			pre = 50 + 300 * Math.abs((this.width / 2) - j) / this.width
			this.heat[x] = (Math.random() * pre) + (255 - pre);
		}
	}

	color(x, y) {
		let t, h, s, b
		t = this.heat[this.index(x, y)] // 0-255
		h = this.hue + (30 * t / 255)
		s = 1000 - 200 * (t / 255) * (t / 255)
		b = (t / 255) * 1000
		return this.np.makeHSB(h, s, b)
	}

	draw() {
		let i, j, a, b, color
		let idx
		this.update()
		for (j = 0; j < this.width; j++) {
			for (i = 0; i < this.height; i++) {
				color = this.color(j, i)
				a = j * this.height
				// b = j & 1 ? this.width - i - 1 : i
				b = i
				idx = a + b
				this.np.setPixel(idx, color)
			}
		}
		this.np.update()
	}

	print() {
		let i, j
		for (i = this.height - 1; i >= 0; i--) {
			for (j = 0; j < this.width; j++) {
					trace(this.heat[this.index(j, i)])
					trace(",")
			}
			trace("\n")
		}
	}
}

class Button extends Monitor {
	constructor(pin) {
		super({pin, mode: Digital.InputPullUp, edge: Monitor.Rising | Monitor.Falling});
		this.onChanged = this.nop;
	}
	nop() {
	}
}

let tick = 15
const monitor = new Button(39)
monitor.onChanged = function() {
	if (this.read()) {
		tick = (tick + 30) % 360
	}
}

const flame = new Flame(8, 8, np)
Timer.repeat(() => {
	flame.hue = tick
	flame.draw()
}, 33);
