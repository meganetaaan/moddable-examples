import BLEClient from './BLEClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const bleClient = new BLEClient()
  const connectButton = document.querySelector('.ble-connect-button')
  const sendButton = document.querySelector('.qr-send-button')
  const status = document.querySelector('.ble-status')
  const message = document.querySelector('.qr-message')

  function setConnected (connected) {
    status.classList.toggle('connected', connected)
    status.classList.toggle('disconnected', !connected)
    connectButton.disabled = connected
    sendButton.disabled = !connected
    status.textContent = connected ? 'Device connected' : 'Device disconnected'
  }

  bleClient.onConnected = () => {
    setConnected(true)
  }
  bleClient.onDisconnected = () => {
    setConnected(false)
  }

  connectButton.addEventListener('click', async () => {
    connectButton.disabled = true
    try {
      await bleClient.connect()
    } catch (error) {
      console.error(error)
      setConnected(false)
      message.textContent = error.message
    }
  })

  const qrForm = document.querySelector('.qr-form')
  qrForm.addEventListener('submit', async event => {
    event.preventDefault()
    const qrText = document.querySelector('.qr-text').value
    if (!qrText) return

    sendButton.disabled = true
    try {
      await bleClient.sendText(qrText)
      message.textContent = 'QR sent'
    } catch (error) {
      console.error(error)
      message.textContent = error.message
    } finally {
      sendButton.disabled = !bleClient.isConnected
    }
  })
})
