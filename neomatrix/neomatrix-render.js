/* eslint-disable camelcase */
/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK Runtime.
 *
 *   The Moddable SDK Runtime is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   The Moddable SDK Runtime is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with the Moddable SDK Runtime.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Bitmap from "commodetto/Bitmap";
import { NeoMatrix } from "neomatrix";

export class NeoMatrixRender {
  constructor(dictionary) {
    this.width = dictionary.width;
    this.height = dictionary.height;
    this.pixelFormat = dictionary.pixelFormat
      ? dictionary.pixelFormat
      : Bitmap.RGB332;
    this.pin = dictionary.pin ? dictionary.pin : 21;
    this.matrix = new NeoMatrix({
      width: this.width,
      height: this.height,
      pin: this.pin,
      order: "GRB"
    });
    this.idx = 0
  }

  begin(x, y, width, height) {
    // x, yからwidth, height分のピクセルのデータ送信を開始する
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.idx = 0;
  }

  send(pixels, offset, count) {
    if (this.x == null) {
      throw new Error("begin should be called first");
    }
    const m = this.matrix;
    const u16a = new Uint16Array(pixels);
    const len = u16a.length;
    for (let i = this.idx; i < this.idx + len; i++) {
      const pixel = u16a[i]
      const r = (pixel & 0b1111100000000000) >> 8
      // const g = 0
      // const b = 0
      const g = (pixel & 0b0000011111100000) >> 3
      const b = (pixel & 0b0000000000011111) << 3
      const x = (i % this.w) + this.x;
      const y = Math.floor(i / this.w) + this.y;
      m.setPixel(x, y, m.makeRGB(r, g, b));
    }
    this.idx += len
    // offsetからcountバイト分のバイト列を送信する
  }

  end() {
    // データ送信を終了する
    this._update();
    this.x = this.y = this.w = this.h = null;
  }

  _update() {
    this.matrix.update();
  }

  adaptInvalid(r) {
    r.x = 0;
    r.y = 0;
    r.w = this.width;
    r.h = this.height;
  }

  continue(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.idx = 0;
    // empty implementation overrides PixelOut.continue which throws
  }

  pixelsToBytes(count) {
    const bytes = (count * Bitmap.depth(this.pixelFormat)) >> 3;
    return bytes
  }

  get async() {
    return false;
  }

  get clut() {}

  set clut(clut) {}

  get c_dispatch() {}
}

Object.freeze(NeoMatrixRender.prototype);
