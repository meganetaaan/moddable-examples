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
import { IOCapability } from 'sm'
import { uuid } from 'btutils'

const DEVICE_NAME = 'Keyboard'

class BLEKeyboardServer extends BLEServer {
  onReady () {
    this.securityParameters = {
      encryption: true,
      mitm: false,
      bonding: true,
      ioCapability: IOCapability.NoInputNoOutput
    }
    this.onDisconnected()
  }
  onAuthenticated () {
    this.authenticated = true
    trace('server authenticated')
  }
  onConnected (connection) {
    this.stopAdvertising()
  }
  onDisconnected (connection) {
    this.startAdvertising({
      advertisingData: {
        flags: 6,
        completeName: DEVICE_NAME,
        completeUUID16List: [uuid(['1812'])]
      }
    })
  }
  onPasskeyConfirm (params) {
    let passkey = this.passkeyToString(params.passkey)
    trace(`server confirm passkey: ${passkey}\n`)
    this.passkeyReply(params.address, true)
  }
  onPasskeyDisplay (params) {
    let passkey = this.passkeyToString(params.passkey)
    trace(`server display passkey: ${passkey}\n`)
  }
  onPasskeyRequested (params) {
    let passkey = Math.round(Math.random() * 999999)
    trace(`server requested passkey: ${this.passkeyToString(passkey)}\n`)
    return passkey
  }
  onCharacteristicWritten (params, value) {
    trace(value)
  }
  passkeyToString (passkey) {
    return passkey.toString().padStart(6, '0')
  }
}

export default BLEKeyboardServer
