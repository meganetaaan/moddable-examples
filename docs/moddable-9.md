# Moddable 9移行ノート

このリポジトリはModdable SDK 9.0.0とECMA-419第4版を検証基準にしています。将来版で偶然ビルドできることより、固定したSDKでサンプルの意図とハードウェア境界が明確であることを優先します。

## 実装方針

- ボード固有のI/Oは`device.io`から取得し、ドライバーへコンストラクターとして渡します。
- 汎用I/Oは`embedded:io/*`、ネットワークは`embedded:network/*`のECMA-419 APIを使います。
- 所有するI/Oには`close()`を実装し、利用できる箇所では`Symbol.dispose`も公開します。
- センサーの変換、座標計算、HTTPパス生成など、ホスト上で検証できる純粋な処理だけを分離します。
- 互換レイヤー、単一実装のための抽象基底クラス、未使用の設定項目は追加しません。
- Node側は標準ライブラリを優先し、プロトコル実装が必要なThereminの`ws`だけを直接依存に残します。

## 主なAPI対応

| 旧実装 | 現在の実装 |
| --- | --- |
| `pins/digital`、`pins/analog`、`pins/i2c`、`pins/pwm` | `device.io`または`embedded:io/*` |
| ドライバー内で固定したI2C/PWM | 呼び出し側から渡すconstructor-IO |
| 旧Files API | `embedded:io/files` |
| `http`クライアント/サーバー | `embedded:network/http/client`、`embedded:network/http/server` |
| 旧WebSocketクライアント | ECMA-419 WebSocket |
| `bleserver`と生成GATT JSON | `embedded:io/bluetoothle/peripheral`の`GATTServer` |
| ブラウザーの`writeValue()` | `writeValueWithResponse()` |
| Piuアプリの直接`AudioOut`キュー | `piu/Sound` |
| ESP-IDFの廃止MAC API | `esp_read_mac()`と`xsmc` |

Atom EchoのMAUD再生はサンプル自体がサンプルストリームを扱うため、低水準の`embedded:io/audio/out`を意図的に使用しています。Piu UI用音声と同じ目的ではありません。

## 検証の境界

ルートのNodeテストは、I/Oモックを使ったセンサードライバー、サーボ範囲、NeoMatrix座標、HTTPユーティリティ、BLEフレーミング、Web Bluetoothクライアント、開発用静的サーバーを検証します。Thereminサーバーには実際のHTTP/WebSocket接続を使う統合テストがあります。

```sh
npm ci
npm run check
npm audit --audit-level=high
npm --prefix theremin/server ci
npm --prefix theremin/server test
npm --prefix theremin/server audit --audit-level=high
```

Moddable側は`scripts/build-examples.mjs`に31アプリケーション・51構成を明示しています。`MODDABLE`、`IDF_PATH`、`mcconfig`をセットアップしてから実行します。

```sh
npm run build:examples
```

この検証はコンパイル、リソース変換、ネイティブリンクまでを対象にします。実機固有の配線、センサー値、BLEペアリング、ディスプレイ、スピーカー、Wi-Fi、外部サービスの応答は、対応ハードウェアと資格情報を使った追加確認が必要です。

## 外部サービスの扱い

- IFTTTキーとX Bearer Tokenはマニフェストの安全なプレースホルダーを既定値にし、実行時設定がない場合は送信しません。
- X検索はAPI v2のレスポンスを表示モデルへ正規化し、ユーザー情報やメトリクスの欠落を許容します。
- LINE Things Developer Trialは終了済みです。LINE Things例はPSDIと暗号化characteristicを持つカスタムGATT例としてのみ維持します。
- BLEキーボード例はHID GATT契約を示します。元のサンプルと同様に物理キー入力源は持たず、未入力時の8-byte reportを公開します。
- ブラウザーBLE例はWeb Bluetoothの安全なコンテキスト要件に合わせ、依存のないlocalhostサーバーを共有します。

## 参照資料

- [Moddable SDK 9.0.0 release](https://github.com/Moddable-OpenSource/moddable/releases/tag/9.0.0)
- [ModdableのECMA-419実装ガイド](https://github.com/Moddable-OpenSource/moddable/tree/9.0.0/guides/implement419)
- [ECMA-419標準](https://419.ecma-international.org/)
- [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)
- [LINE Things Developer Trial終了のお知らせ](https://developers.line.biz/en/news/tags/line-things/1/)
