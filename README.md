# Moddableサンプルコード集

M5StackとESP32向けのModdableサンプルです。実装はModdable SDK 9.0.0とECMA-419第4版を基準にしています。

## 対応環境

- [Moddable SDK 9.0.0](https://github.com/Moddable-OpenSource/moddable/releases/tag/9.0.0)
- Moddable 9.0.0が指定するESP-IDF 6.0.2
- [ECMA-419第4版（2026年6月）](https://ecma-international.org/publications-and-standards/standards/ecma-419/)
- Node.js 20.19.0以上の20.x、22.13.0以上の22.x、または24以降（21.x、22.0〜22.12、23.xは非対応）

SDKは`9.0.0`タグをcheckoutしてください。別バージョンへの追従は、全ビルドマトリクスを確認したうえで行います。実装方針と旧APIからの対応は[Moddable 9移行ノート](docs/moddable-9.md)にまとめています。

## セットアップ

[Moddable公式のGetting Started](https://github.com/Moddable-OpenSource/moddable/blob/9.0.0/documentation/Moddable%20SDK%20-%20Getting%20Started.md)に従ってSDKとESP-IDFを準備し、シェルで`MODDABLE`と`IDF_PATH`を設定します。

Node側の検査依存はリポジトリのルートでインストールします。

```sh
npm ci
npm run check
```

`npm run check`はESLintと単体・統合テストを実行します。Thereminサーバーは依存を分離しているため、次の検査も実行してください。

```sh
npm --prefix theremin/server ci
npm --prefix theremin/server test
```

## ビルド

個別のサンプルは、そのディレクトリでビルドします。`-t build`はデバイスへ書き込まず、コンパイルとリンクだけを行います。

```sh
cd counter
mcconfig -d -m -p esp32/m5stack -t build
```

全31アプリケーション・全51ボード構成を直列に検証するコマンドも用意しています。同一ターゲットのビルドキャッシュを共有するため、並列実行はしません。

```sh
npm run build:examples
```

名前を指定すると一部だけを再実行できます。

```sh
npm run build:examples -- ble-keyboard color-stick
```

書き込み時は各サンプルのディレクトリで`-t build`を外してください。

```sh
mcconfig -d -m -p esp32/m5stack
```

## サンプル一覧

| パス | 内容 | 検証ターゲット |
| --- | --- | --- |
| `ble/keyboard/keyboard_periferal` | HIDキーボードのGATT定義と接続 | ESP32 |
| `ble/line-things/line-things-periferal` | LINE Things由来の暗号化カスタムGATT | M5Stack、Fire |
| `ble/mai5/mai5-periferal` | 接続状態を音声と表情で通知 | M5Stack、Fire |
| `ble/qr-ble/qr-ble-periferal` | BLE受信文字列をQRコード表示 | M5Stack、Fire |
| `bongo` | ボタンでBongo Catの画像と音声を再生 | M5Stack、Fire |
| `bongo_colorful` | Bongo CatとNeoPixel演出 | M5Stack、Fire |
| `counter` | ボタンカウンター | M5Stack、Fire |
| `files` | ECMA-419 Files APIによる読み書き | ESP32 |
| `flame` | 16×16 NeoMatrixの炎エフェクト | ESP32 |
| `jslogo` | JavaScript/Moddableロゴ表示 | M5Stack、Fire |
| `meoow-button-atomecho` | ボタン、HTTPS、NeoPixel、音声出力 | Atom Echo |
| `neomatrix-flicker` | NeoMatrixをPiuディスプレイとして使用 | ESP32 |
| `neomatrix` | BMPをNeoMatrixへ描画 | ESP32 |
| `network/ifttt-client` | IFTTT Webhook HTTPSクライアント | M5Stack、Fire |
| `network/light-server` | HTTP/DNS-SDでNeoPixelを制御 | ESP32 |
| `network/plant-logger` | Analog/Digitalセンサー値を記録 | ESP32 |
| `network/security-logger` | PIRセンサー値を記録 | ESP32 |
| `piu-e-ink` | 400×300 e-paper向けPiu UI | ESP32（記載配線） |
| `pomodoro` | ポモドーロタイマー | M5Stack、Fire |
| `psram` | 外部RAMの割り当て確認 | ESP32（PSRAM搭載機） |
| `roboto` | Atom Matrix、NeoMatrix、PWMサーボ | Atom Matrix |
| `servo` | M5Stack Servo HAT制御 | M5Stack |
| `theremin/client` | ToFセンサーとWebSocketによるテルミン | M5Stack、Fire |
| `twitter` | X API v2の検索結果表示 | M5Stack、Fire |
| `unit/color` | Color Unitによる色取得 | M5Stack、Fire、M5StickC |
| `unit/env` | DHT12温湿度表示 | M5Stack、Fire、M5StickC |
| `unit/joystick` | Joystick UnitのI2C読み取り | M5Stack |
| `unit/neopixel` | NeoPixel点灯 | ESP32、M5Stack、Fire、M5StickC |
| `unit/neostrand` | NeoStrandエフェクト切り替え | M5Stack、Fire、M5StickC |
| `unit/piano` | M5Pianoの25鍵タッチ入力、LED、音階出力 | M5Stack |
| `unit/relay` | Relay UnitとPiu表示 | M5Stack |

M5Pianoのタッチ感度は既定値5です。値を下げるほど高感度になり、`mcconfig -d -m -p esp32/m5stack pianoSensitivity=3`のように0〜15で調整できます。

## ネットワーク、ブラウザー、外部サービス

Wi-Fiを使うサンプルは`mcconfig`へ認証情報を渡します。APIキーやトークンをマニフェストへ直接コミットしないでください。

```sh
mcconfig -d -m -p esp32/m5stack ssid="YOUR_SSID" password="YOUR_PASSWORD"
```

- IFTTTは`iftttEvent`と`iftttKey`、X検索は`xBearerToken`をコマンドライン設定で上書きします。プレースホルダーのままでは外部リクエストを行いません。
- Thereminは`host`と`port`をWebSocketサーバーへ合わせて上書きします。
- `ble/mai5/mai5-central`と`ble/qr-ble/central`は、各ディレクトリで`npm start`を実行します。Web Bluetoothには対応ブラウザーとlocalhostまたはHTTPSの安全なコンテキストが必要です。
- `theremin/server`は`npm start`でHTTP/WebSocketサーバーを起動します。
- [LINE Things Developer Trialは2024年3月31日に終了](https://developers.line.biz/en/news/tags/line-things/1/)しています。`ble/line-things`は現在もビルドできるカスタムGATTの履歴サンプルであり、終了したLINEサービスへの接続を保証するものではありません。

## クレジット

Bongo Cat originally created by @StrayRogue and @DitzyFlama.

Cat image by [obBilder](https://pixabay.com/users/obBilder-3192627/) from [Pixabay](https://pixabay.com/).
