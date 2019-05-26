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
/*
/*
 https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.human_interface_device.xml
 https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.report.xml
 https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.report_reference.xml

 http://www.usb.org/developers/hidpage/HID1_11.pdf
 http://www.usb.org/developers/hidpage/Hut1_12v2.pdf
 https://docs.mbed.com/docs/ble-hid/en/latest/api/md_doc_HID.html
*/

import { BLEHIDClient, ReportType, UsageID } from 'hidclient'

const reportMap = [
  0x05,
  0x01, // USAGE_PAGE (Generic Desktop)
  0x09,
  0x06, // USAGE (Keyboard)
  0xa1,
  0x01, // COLLECTION (Application)
  0x85,
  0x01, //  REPORT_ID (1)

  0x05,
  0x07, //   USAGE_PAGE (usage = keyboard page)
  // モデファイヤキー(修飾キー)
  0x19,
  0xe0, //     USAGE_MINIMUM (左CTRLが0xe0)
  0x29,
  0xe7, //     USAGE_MAXIMUM (右GUIが0xe7)
  0x15,
  0x00, //   LOGICAL_MINIMUM (0)
  0x25,
  0x01, //   LOGICAL_MAXIMUM (1)
  0x95,
  0x08, //   REPORT_COUNT (8) 全部で8つ(左右4つずつ)。
  0x75,
  0x01, //   REPORT_SIZE (1) 各修飾キーにつき1ビット
  0x81,
  0x02, //   INPUT (Data,Var,Abs) 8ビット長のInputフィールド(変数)が1つ。
  // 予約フィールド
  0x95,
  0x01, //   REPORT_COUNT (1)
  0x75,
  0x08, //   REPORT_SIZE (8) 1ビットが8つ。
  0x81,
  0x01, //   INPUT (Cnst,Var,Abs)
  // LED状態のアウトプット
  0x95,
  0x05, //   REPORT_COUNT (5) 全部で5つ。
  0x75,
  0x01, //   REPORT_SIZE (1)  各LEDにつき1ビット
  0x05,
  0x08, //   USAGE_PAGE (LEDs)
  0x19,
  0x01, //     USAGE_MINIMUM (1) (NumLock LEDが1)
  0x29,
  0x05, //     USAGE_MAXIMUM (5) (KANA LEDが5)
  0x91,
  0x02, //   OUTPUT (Data,Var,Abs) // LED report
  // LEDレポートのパディング
  0x95,
  0x01, //   REPORT_COUNT (1)
  0x75,
  0x03, //   REPORT_SIZE (3) 残りの3ビットを埋める。
  0x91,
  0x01, //   OUTPUT (Cnst,Var,Abs) // padding
  // 押下情報のインプット
  0x95,
  0x06, //   REPORT_COUNT (6) 全部で6つ。
  0x75,
  0x08, //   REPORT_SIZE (8) おのおの8ビットで表現
  0x15,
  0x00, //   LOGICAL_MINIMUM (0) キーコードの範囲は、
  0x25,
  0xdd, //   LOGICAL_MAXIMUM (221) 0～221(0xdd)まで

  0x05,
  0x07, //   USAGE_PAGE (Keyboard)
  0x19,
  0x00, //     USAGE_MINIMUM (0はキーコードではない)
  0x29,
  0xdd, //     USAGE_MAXIMUM (Keypad Hexadecimalまで)
  0x81,
  0x00, //   INPUT (Data,Ary,Abs)
  0xc0 // END_COLLECTION
]

const Modifiers = {
  LEFT_CONTROL: 0x01,
  LEFT_SHIFT: 0x02,
  LEFT_ALT: 0x04,
  LEFT_GUI: 0x08,
  RIGHT_CONTROL: 0x10,
  RIGHT_SHIFT: 0x20,
  RIGHT_ALT: 0x40,
  RIGHT_GUI: 0x80
}
Object.freeze(Modifiers)

const Indicators = {
  NUM_LOCK: 0x01,
  CAPS_LOCK: 0x02,
  SCROLL_LOCK: 0x04,
  COMPOSE: 0x08,
  KANA: 0x10,
  CONSTANT0: 0x20,
  CONSTANT1: 0x40,
  CONSTANT2: 0x80
}
Object.freeze(Indicators)

const Codes40 = [13, 27, 8, 9, 32] // key codes 40 - 44
const Codes45 = [45, 61, 91, 93, 92, 35, 59, 39, 96, 44, 46, 47] // key codes 45 - 56
const Codes79 = [67, 68, 66, 65] // key codes 79 - 82 (arrows)
const Codes84 = [47, 42, 45, 43, 13] // key codes 84 - 88
const Codes89 = [35, 40, 34, 37, 53, 39, 36, 38, 33, 45, 46] // key codes 89 - 99
const ShiftCodes45 = [95, 43, 123, 125, 124, 126, 58, 34, 126, 60, 62, 63] // shifted key codes 45 - 56
const ShiftCodes30 = [33, 64, 35, 36, 37, 94, 38, 42, 40] // shifted key codes 30 - 38
const NumLockCodes89 = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 46] // num lock key codes 89 - 99

class BLEHIDKeyboard extends BLEHIDClient {
  constructor () {
    super()
    this.configure({
      usageID: UsageID.KEYBOARD,
      reportTypes: [ReportType.INPUT, ReportType.OUTPUT]
    })
    this.onDeviceDisconnected()
  }
  onCharacteristicNotification (characteristic, value) {
    this.onReportData(value)
  }
  onDeviceDisconnected () {
    this.lastKeyCount = 0
    this.lastKeys = new Uint8Array(6)
    this.keys = new Uint8Array(6)
    this.indicators = 0
    this.outputReportCharacteristic = null
  }
  onDeviceReportMap (value) {}
  onDeviceReports (reports) {
    let enabledNotifications = false
    reports.forEach((report) => {
      if (ReportType.OUTPUT == report.reportType) {
        this.outputReportCharacteristic = report.characteristic
      } else if (
        !enabledNotifications &&
        ReportType.INPUT == report.reportType
      ) {
        enabledNotifications = true
        report.characteristic.enableNotifications()
      }
    })
  }
  onReportData (report) {
    // This is the 8 byte HID keyboard report
    // trace(report.join(' ') + '\n');
    // return;
    let i, j, found, key
    let keyCount = 0
    for (i = 2; i < 8; ++i) {
      let key = report[i]
      if (key == 0) break
      for (j = 0, found = false; j < this.lastKeyCount; ++j) {
        if (this.lastKeys[j] == key) {
          found = true
          break
        }
      }
      if (!found) this.keys[keyCount++] = key
    }

    this.lastKeyCount = i - 2
    for (i = 0; i < this.lastKeyCount; ++i) this.lastKeys[i] = report[2 + i]

    /**
		if (keyCount)
			trace("take: " + this.keys.slice(0, keyCount).join(' ') + "\n");
		else
			trace("take: none\n");
		**/
    let modifier = report[0]

    for (i = 0; i < keyCount; ++i) {
      let shift =
        this.capsLock ||
        modifier & (Modifiers.LEFT_SHIFT | Modifiers.RIGHT_SHIFT)
      let code = 0
      let escape

      key = this.keys[i]

      if (key >= 4 && key <= 29) {
        // a-z
        key -= 4
        code = shift ? key + 65 : key + 97
      } else if (key >= 30 && key <= 38) {
        // 1-9
        key -= 30
        code = shift ? ShiftCodes30[key] : key + 49
      } else if (key == 39) code = shift ? 41 : 48
      // ) or 0
      else if (key >= 40 && key <= 44) {
        key -= 40
        code = Codes40[key]
      } else if (key >= 45 && key <= 56) {
        // - to /
        key -= 45
        code = shift ? ShiftCodes45[key] : Codes45[key]
      } else if (key == 57) {
        // caps lock
        this.indicators ^= Indicators.CAPS_LOCK
        this.updateIndicators()
      } else if (key == 71) {
        // scroll lock
        this.indicators ^= Indicators.SCROLL_LOCK
        this.updateIndicators()
      }
      if (key >= 79 && key <= 82) {
        // arrow keys
        key -= 79
        code = Codes79[key]
        escape = true
      } else if (key == 83) {
        // num lock
        this.indicators ^= Indicators.NUM_LOCK
        this.updateIndicators()
      } else if (key >= 84 && key <= 88) {
        // keypad / to keypad enter
        key -= 84
        code = Codes84[key]
      } else if (key >= 89 && key <= 99) {
        // keypad 1 to keypad .
        key -= 89
        code = this.numLock ? NumLockCodes89[key] : Codes89[key]
      } else {
        // trace(`unhandled report key ${key}\n`);
      }
      if (code != 0) {
        if (escape) this.onCharCode(27)
        this.onCharCode(code)
      }
    }
  }
  updateIndicators () {
    if (this.outputReportCharacteristic) {
      this.outputReportCharacteristic.writeWithoutResponse(
        Uint8Array.of(this.indicators)
      )
    }
  }
}

export default BLEHIDKeyboard
