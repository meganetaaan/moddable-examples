class Oscillator {
  constructor () {
    this.context = new AudioContext()
    this.oscillator = this.context.createOscillator()
    this.gain = this.context.createGain()
    this.gain.gain.value = 0
    this.oscillator.connect(this.gain).connect(this.context.destination)
    this.started = false
  }

  async setMuted (muted) {
    if (!muted) {
      if (!this.started) {
        this.oscillator.start()
        this.started = true
      }
      await this.context.resume()
    }

    this.gain.gain.setTargetAtTime(
      muted ? 0 : 0.2,
      this.context.currentTime,
      0.01
    )
  }

  setFrequency (frequency) {
    if (!Number.isFinite(frequency) || frequency < 20 || frequency > 20_000) {
      return false
    }

    this.oscillator.frequency.setTargetAtTime(
      frequency,
      this.context.currentTime,
      1 / 60
    )
    return true
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const oscillator = new Oscillator()
  const frequencyElement = document.querySelector('.frequency-value')
  const muteButton = document.getElementById('muteButton')

  muteButton.addEventListener('click', async () => {
    const muted = !muteButton.classList.contains('muted')
    await oscillator.setMuted(muted)
    muteButton.classList.toggle('muted', muted)
    muteButton.setAttribute('aria-pressed', String(!muted))
  })

  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const socket = new WebSocket(`${protocol}//${location.host}/`)
  socket.addEventListener('open', () => console.log('connected'))
  socket.addEventListener('message', event => {
    const frequency = Number(event.data)
    if (!oscillator.setFrequency(frequency)) return

    frequencyElement.textContent = frequency.toFixed(1)
  })
  socket.addEventListener('close', () => console.log('disconnected'))
})
