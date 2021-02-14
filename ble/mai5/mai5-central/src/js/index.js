import BLEClient from './BLEClient.js'

/* global document */

document.addEventListener('DOMContentLoaded', () => {
  const bleClient = new BLEClient()
  bleClient.onConnected = () => {
    const contents = document.querySelectorAll('.ble-status,.guide')
    for (let c of contents) {
      c.classList.remove('disconnected', 'initial')
      c.classList.add('connected')
    }
  }
  bleClient.onDisconnected = () => {
    const contents = document.querySelectorAll('.ble-status,.guide')
    for (let c of contents) {
      c.classList.remove('connected', 'initial')
      c.classList.add('disconnected')
    }
  }

  const connectButton = document.querySelector('.ble-connect-button')
  connectButton.addEventListener('click', async function () {
    await bleClient.connect()
  })
})
