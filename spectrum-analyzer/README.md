# Moddable Stream + Piu Spectrum Analyzer

Moddable SDK 9.0.0の`AudioIn`をWeb Streams APIへ接続し、Piuの軽量描画オブジェクト`Port`でリアルタイム表示するスペクトラムアナライザーです。

## 構成

```
AudioIn → ReadableStream → Worker-backed WritableStream → Worker (Hann窓 / FFT / 対数バンド) → Piu Port
```

- 入力: 22.05 kHz / mono / signed 16-bit LPCM
- 解析: 256点 radix-2 FFT、24本の対数周波数バンド、約21.5 Hz更新
- 表示: バー、ピークホールド、支配周波数、dBFS
- 遅延対策: Streamのbackpressureが掛かったときは古い入力を破棄し、表示待ちを蓄積しません
- 描画負荷対策: バーごとのPiu `Content`を作らず、単一の`Port`から直接描画します
- 応答性対策: FFTは独立したModdable `Worker` VMで実行し、Piu/UIのVMをブロックしません

## 実行

PCのマイクとModdable Simulatorを使う場合:

```sh
mcconfig -d -m -p lin
```

macOSでは`lin`を`mac`、Windowsでは`win`に置き換えます。

録音デバイスがない環境では、1 kHzの内蔵テスト信号でStream・FFT・描画の全経路を確認できます:

```sh
mcconfig -d -m -p lin syntheticAudio=true
```

グラフ内に約`1.0kHz / -6dB`と表示され、1 kHz付近のバーが上がれば正常です。256点FFTの周波数分解能は約86 Hzです。`syntheticAudio`を省略するか`false`にすると実マイク入力へ戻ります。

CPU負荷を確認するときはデバッガ計測を含まないreleaseビルドも使えます:

```sh
mcconfig -m -p lin syntheticAudio=true
```

`-d`ではメインVMとWorker VMの両方にXSのデバッグ計測が入るため、release版よりCPU使用率が大きくなります。debug版の`mc.so`を`mcsim`から直接起動する場合は、先に`xsbug`を起動してください。デバッガ未接続のWorkerは計測値を標準出力へ送るため、負荷測定を歪めます。

M5Stack Core2（内蔵マイク・320×240ディスプレイ）の例:

```sh
mcconfig -d -m -p esp32/m5stack_core2
```

対象ボードのmanifestに`audioIn`と画面ドライバが定義されていれば、同じアプリをそのターゲット名でビルドできます。外付けI²Sマイクを使う場合は、対象ボードmanifestの`defines.audioIn.i2s`で`bck_pin`、`lr_pin`、`datain`、必要なら`format_i2s`や`slot`を設定してください。

解析条件は[config.js](./config.js)に集約しています。`analysisEveryFrames`でFFT更新頻度、`displayFPS`で描画上限、`hopSize`でオーバーラップ量を調整できます。

## 主なファイル

- `audio-stream.js`: `AudioIn`をbounded `ReadableStream`に変換
- `tone-stream.js`: シミュレーター確認用の1 kHzテスト信号
- `fft-spectrum.js`: Hann窓、FFT、対数バンド集約
- `spectrum-worker.js`: FFTを実行するWorkerエントリ
- `spectrum-worker-stream.js`: backpressure付きWorker `WritableStream`
- `spectrum-port.js`: 1個のPiu `Port`による可視化
- `main.js`: Streamパイプラインの接続
