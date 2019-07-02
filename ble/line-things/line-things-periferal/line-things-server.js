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
import getMacAddress from 'mac-address'

// import UUID from "uuid";

const DEVICE_NAME = 'M5Stack'
const SERVICE_UUID_LIST = ['91E4E176-D0B9-464D-9FE4-52EE3E9F1552']
const uuidList = [uuid(SERVICE_UUID_LIST)]

class LineThingsServer extends BLEServer {
  onReady () {
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
    this.onStatusChange('CONNECTED')
    this.stopAdvertising()
  }
  onDisconnected (connection) {
    this.onStatusChange('READY')
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
  onCharacteristicNotifyEnabled (characteristic) {
    if (characteristic.name === 'notify') {
      this.notifyCharacteristic = characteristic
    }
  }
  onCharacteristicNotifyDisabled (characteristic) {
    if (characteristic.name === 'notify') {
      this.notifyCharacteristic = null
    }
  }
  onCharacteristicRead (params) {
    trace(params.name)
    if (params.name === 'value') {
      const value = getMacAddress()
      trace(Hex.toString(value))
      return value
    }
    return 0
  }
  onCharacteristicWritten (params, value) {
    if (params.name === 'write') {
      this.onWritten(value)
    }
  }
  onWritten (value) {
    // noop, to be overridden
  }
  onStatusChange (status) {
    // noop, to be overridden
  }
}

export default LineThingsServer
