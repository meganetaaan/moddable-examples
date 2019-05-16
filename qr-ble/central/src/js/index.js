import BLEClient from './BLEClient.js'

/* global document */

document.addEventListener('DOMContentLoaded', () => {
  const bleClient = new BLEClient()
  bleClient.onConnected = () => {
    const status = document.querySelector('.ble-status')
    status.classList.remove('disconnected')
    status.classList.add('connected')
  }
  bleClient.onDisconnected = () => {
    const status = document.querySelector('.ble-status')
    status.classList.remove('connected')
    status.classList.add('disconnected')
  }

  const connectButton = document.querySelector('.ble-connect-button')
  connectButton.addEventListener('click', bleClient.connect)

  const qrForm = document.querySelector('.qr-form')
  qrForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!bleClient.isConnected) {
      return
    }
    const qrText = document.querySelector('.qr-text').value
    if (qrText == null || qrText.length === 0) {
      return
    }
    bleClient.sendText(qrText)
  })
})
