/*
 * Copyright (c) 2016-2018  Moddable Tech, Inc.
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

import BLEServer from "bleserver";
import { uuid } from "btutils";

const DEVICE_NAME = 'M5Stack'
const SERVICE_UUID = '6b0d0503-dcaa-4041-8ab4-630d7d9017dc'        // sendqr service

class QRServer extends BLEServer {
	onReady() {
		this.qr = ''
		this.deviceName = DEVICE_NAME;
		this.onDisconnected();
	}
	onConnected(connection) {
		this.stopAdvertising();
	}
	onDisconnected(connection) {
		this.startAdvertising({
			advertisingData: { flags: 6, completeName: DEVICE_NAME, completeUUID128List: [uuid([SERVICE_UUID])] }
		});
	}
	onCharacteristicWritten(params) {
		let value = params.value;
		if ('qr' == params.name) {
			const strValue = String.fromArrayBuffer(value);
			if (strValue === '\r') {
				if (typeof this.onQRChange === 'function') {
					this.onQRChange(this.qr)
				}
				this.qr = ''
			}
			this.qr += strValue
		}
	}
}

export default QRServer

