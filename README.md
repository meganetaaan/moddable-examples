# Moddableサンプルコード集

M5StackとModdableを使ったサンプルコード集です。

## 対応環境

- [Moddable SDK 9.0.0](https://github.com/Moddable-OpenSource/moddable/releases/tag/9.0.0)
- ESP32をビルドする場合は、Moddable 9.0.0が指定するESP-IDF 6.0.2
- ソースコード検査にはNode.js 20.19.0以上の20.x、22.13.0以上の22.x、または24以降（21.x、22.0〜22.12、23.xは非対応）

Moddable SDKは`9.0.0`タグをcheckoutしてください。新しいSDKへの追従は、互換性を確認したうえで別途行います。

## 必要な環境と機材

### M5Stack

* ESP32を搭載した開発ボードです。
* https://m5stack.com/
* 日本国内では[スイッチサイエンス](https://www.switch-science.com/catalog/list/770/)や[ヨドバシ.com](https://www.yodobashi.com/maker/5000003374/)から購入できます。

### Moddable SDK

* JavaScriptでマイコン向けのプログラムを開発できるSDKです。
* https://www.moddable.com/
* [v9.0.0の公式手順](https://github.com/Moddable-OpenSource/moddable/blob/9.0.0/documentation/Moddable%20SDK%20-%20Getting%20Started.md)に従ってセットアップしてください。

## ビルド方法

書き込みを行わずにビルドだけを確認する場合は、各サンプルのディレクトリで次を実行します。

```sh
mcconfig -dn -m -p esp32/m5stack -t build
```

デバイスへ書き込む場合はUSB接続後、`-t build`を外します。

```sh
mcconfig -d -m -p esp32/m5stack
```

ソースコード検査はリポジトリのルートで実行します。

```sh
npm ci
npm run lint
```

## 各サンプルの紹介

### bongo

ボンゴキャットがボンゴを叩く！ひたすら叩く！

* Aボタン、Cボタン：ボンゴを叩く
* Bボタン：ニャーンと鳴く

Bongo Cat originally created by @StrayRogue and @DitzyFlama
Image by <a href="https://pixabay.com/users/obBilder-3192627/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1661115">obBilder</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1661115">Pixabay</a>

### counter

ボタンを押すとカウントアップするカウンターです。

### pomodoro

ポモドーロタイマーです。

### unit/env

温湿度計のサンプルです。
M5StackのEnvユニットから温度と湿度を取得し、画面に表示します。

### unit/color

カラーピッカーのサンプルです。
M5StackのColorユニットから色を取得し、16進数のカラーコードに変換して表示します。

### unit/neopixel

Neoチカのサンプルです。
M5StackのNeoPixelユニット、またはM5StackFireやM5StackGoに搭載のLEDを光らせます。

### network/ifttt-client

IFTTTのWebHookを叩くクライアントです。

### network/light-server

ネットワーク経由でLEDのON/OFFができるサーバです。

### ble/qr-ble

BLE(Bluetooth Low Energy) を使ったサンプルです。
スマートフォンから文字列を送信し、M5StackにQRコードとして表示できます。

### ble/line-things

- [line/line-things-starter](https://github.com/line/line-things-starter)のModdableSDK向け移植です。
