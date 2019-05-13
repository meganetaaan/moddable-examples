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

/* global trace */

import BLEServer from 'bleserver'
import { uuid } from 'btutils'
import { IOCapability } from 'sm'
import Hex from 'hex'
// import UUID from "uuid";

const DEVICE_NAME = 'M5Stack'
const SERVICE_UUID_LIST = [
  '91E4E176-D0B9-464D-9FE4-52EE3E9F1552'
]
const MAC_ADDRESS = '80:7D:3A:C8:08:CA:00:00'
const SEPARATOR = ':'
const uuidList = [uuid(SERVICE_UUID_LIST)]

class QRServer extends BLEServer {
  onReady () {
    this.count = 0
    this.deviceName = DEVICE_NAME
    this.securityParameters = {
      encryption: true,
      mitm: false,
      bonding: true,
      ioCapability: IOCapability.NoInputNoOutput
    }
    this.onDisconnected()
  }
  onConnected (connection) {
    this.stopAdvertising()
  }
  onDisconnected (connection) {
    this.startAdvertising({
      fast: true,
      connectable: true,
      discoverable: true,
      scanResponseData: {
        flags: 6,
        completeName: DEVICE_NAME
      },
      advertisingData: {
        flags: 6,
        completeName: DEVICE_NAME,
        completeUUID128List: uuidList
      }
    })
  }
  onCharacteristicRead (params) {
    trace(params.name)
    if (params.name === 'value') {
      const value = Hex.toBuffer(MAC_ADDRESS, SEPARATOR)
      trace(Hex.toString(value))
      return value
    }
    return 0
  }
  onCharacteristicWritten (params, value) {
    if (params.name === 'write') {
      this.count++
      trace(this.count)
    }
  }
}

export default QRServer
