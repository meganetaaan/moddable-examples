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
import { IOCapability } from "sm";
import Hex from "hex";
// import UUID from "uuid";

const DEVICE_NAME = "M5Stack";
const SERVICE_UUID_LIST = [
	"91E4E176-D0B9-464D-9FE4-52EE3E9F1552",
	"E625601E-9E55-4597-A598-76018A0D293D"
];
const MAC_ADDRESS = "80:7D:3A:C8:08:CA:00:00";
const SEPARATOR = ":";

class QRServer extends BLEServer {
	onReady() {
		this.qr = "";
		this.deviceName = DEVICE_NAME;
		this.securityParameters = {
			encryption: true,
			mitm: false,
			bonding: true,
			ioCapability: IOCapability.NoInputNoOutput
		};
		this.onDisconnected();
	}
	onConnected(connection) {
		this.stopAdvertising();
	}
	onDisconnected(connection) {
		this.startAdvertising({
			advertisingData: {
				flags: 6,
				completeName: DEVICE_NAME,
				completeUUID128List: [uuid(SERVICE_UUID_LIST)]
			}
		});
	}
	onCharacteristicRead(params) {
		trace(params.name);
		debugger;
		if (params.name === 'value') {
			const value = Hex.toBuffer(MAC_ADDRESS, SEPARATOR);
			trace(Hex.toString(value));
			return value;
		}
		return 0;
	}
	onCharacteristicWritten(params) {
		let value = params.value;
		if ("write" == params.name) {
			const strValue = String.fromArrayBuffer(value);
			if (strValue === "\r") {
				if (typeof this.onQRChange === "function") {
					this.onQRChange(this.qr);
				}
				this.qr = "";
			}
			this.qr += strValue;
		}
	}
}

export default QRServer;
