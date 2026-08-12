import BLEClient from './BLEClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const bleClient = new BLEClient()
  const connectButton = document.querySelector('.ble-connect-button')
  const guide = document.querySelector('.guide')

  function setStatus (status) {
    const contents = document.querySelectorAll('.ble-status,.guide')
    for (const content of contents) {
      content.classList.remove('connected', 'disconnected', 'initial')
      content.classList.add(status)
    }
    guide.textContent = status === 'connected' ? 'Connected' : 'Disconnected'
  }

  bleClient.onConnected = () => {
    setStatus('connected')
    connectButton.disabled = true
  }
  bleClient.onDisconnected = () => {
    setStatus('disconnected')
    connectButton.disabled = false
  }

  connectButton.addEventListener('click', async () => {
    connectButton.disabled = true
    try {
      await bleClient.connect()
    } catch (error) {
      console.error(error)
      setStatus('disconnected')
      connectButton.disabled = false
    }
  })
})
