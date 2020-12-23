/* global location, WebSocket, AudioContext */

class VOscillator {
  constructor () {
    this.ctx = new AudioContext()
    this.started = false
  }

  start () {
    if (this.started) {
      return
    }
    this.osc = this.ctx.createOscillator()
    this.osc.connect(this.ctx.destination)
    this.osc.start()
    this.started = true
  }

  // 音を止める
  stop () {
    if (this.started) {
      this.osc.stop()
      this.started = false
    }
  }

  // 音を鳴らす
  sound (freq) {
    if (!this.started) {
      return
    }
    this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime + 1 / 15)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const oscillator = new VOscillator()
  const heltz = document.querySelector('.frequency-value')

  const muteButton = document.getElementById('muteButton')
  muteButton.addEventListener('click', async () => {
    const muted = muteButton.classList.contains('muted')
    if (muted) {
      oscillator.start()
      muteButton.classList.remove('muted')
    } else {
      oscillator.stop()
      muteButton.classList.add('muted')
    }
    console.log('playback started')
  })

  const socket = new WebSocket(`ws://${location.host}/`)
  socket.onopen = (e) => {
    console.log('connected')
  }
  socket.onmessage = (event) => {
    const tone = Number(event.data)
    oscillator.sound(tone)
    heltz.innerText = tone.toFixed(1)
  }
})
