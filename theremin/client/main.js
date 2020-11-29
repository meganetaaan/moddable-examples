/*
* Copyright (c) 2016-2020 Moddable Tech, Inc.
*
*   This file is part of the Moddable SDK.
*
*   This work is licensed under the
*       Creative Commons Attribution 4.0 International License.
*   To view a copy of this license, visit
*       <https://creativecommons.org/licenses/by/4.0>
*   or send a letter to Creative Commons, PO Box 1866,
*   Mountain View, CA 94042, USA.
*
*/

import Client from "mqtt";
import Net from "net";
import Timer from "timer";
import config from "mc/config";
import ToF from "vl53l0x"

let mqtt  = new Client({
	host: config.mqtt.host,
	port: 1883,
	id: "moddable_" + Net.get("MAC"),
});

let sensor = new ToF

const TOPIC_NAME = "m5stack/accel-gyro"

function loop() {
	let mm = sensor.value
}

mqtt.onReady = function() {
	Timer.repeat(loop, 1000 / FPS)
};

mqtt.onClose = function() {
	trace('lost connection to server\n');
	if (this.timer) {
		Timer.clear(this.timer);
		delete this.timer;
	}
};

const message = JSON.stringify({x, y, z, stamp: Date.now()})
mqtt.publish(TOPIC_NAME, message)
