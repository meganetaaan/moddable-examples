/* global location, WebSocket, AudioContext */

class Oscillator {
  constructor () {
    this.ctx = new AudioContext()
    this.osc = this.ctx.createOscillator()
    this.osc.connect(this.ctx.destination)
    this.playing = false
  }

  // 音を鳴らす
  start () {
    if (this.playing) {
      return
    }
    this.osc.start()
    this.playing = true
  }

  // 音を止める
  stop () {
    if (!this.playing) {
      return
    }
    this.osc.stop()
    this.playing = false
  }

  // 音程を変える
  setFrequency (freq) {
    // NOTE: frequencyを直接書き換えず、setValueAtTimeなどのメソッドを使う
    this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime + 1 / 15)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const oscillator = new Oscillator()
  const heltz = document.querySelector('.frequency-value')

  const muteButton = document.getElementById('muteButton')
  muteButton.addEventListener('click', async () => {
    const muted = muteButton.classList.contains('muted')
    if (muted) {
      // NOTE: クリックを起点に音声を再生開始する
      oscillator.start()
      muteButton.classList.remove('muted')
    } else {
      oscillator.stop()
      muteButton.classList.add('muted')
    }
  })

  const socket = new WebSocket(`ws://${location.host}/`)
  socket.onopen = (e) => {
    console.log('connected')
  }
  socket.onmessage = (event) => {
    const tone = Number(event.data)
    oscillator.setFrequency(tone)
    heltz.innerText = tone.toFixed(1)
  }
  socket.onclose = (e) => {
    console.log('disconnected')
  }
})
