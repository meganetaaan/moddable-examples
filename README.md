# ModdableでつくるIoTアプリケーション（仮） サンプルコード集

## 必要環境（Prerequisities）

### M5Stack

* ESP32を搭載した開発ボードです。
* https://m5stack.com/
* 日本国内では[スイッチサイエンス](https://www.switch-science.com/catalog/list/770/)や[ヨドバシ.com](https://www.yodobashi.com/maker/5000003374/)から購入できます。

### Moddable SDK

* JavaScriptでマイコン向けのプログラムを開発できるSDKです。
* https://www.moddable.com/
* [公式の手順を参考](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md)にセットアップしてください。

## ビルド方法

1. デバイスをPCにUSB接続します
2. 下記のコマンドを実行します。

```sh
$ cd (各サンプルのディレクトリ)
$ mcconfig -d -m -p esp32/m5stack
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
