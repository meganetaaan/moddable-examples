import LineThingsApplication from 'line-things-application'
import LineThingsServer from 'line-things-server'

const server = new LineThingsServer()
const buttonA = global.button.a
const application = new LineThingsApplication({
  server,
  message: 'HELLO'
})

// press buttonA to send notification to central
buttonA.onChanged = function () {
  const value = this.read() === 1 ? 0 : 1
  if (server.notifyCharacteristic != null) {
    server.notifyValue(server.notifyCharacteristic, value)
  }
}

// when characteristics written change application's state
