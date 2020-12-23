const Express = require('express')
const app = Express()
require('express-ws')(app)

let connections = []
app.use(Express.static('public'))
app.ws('/', function (socket) {
  connections.push(socket)
  console.log('connected')

  socket.on('message', function (message) {
    connections.forEach(socket => {
      socket.send(message)
    })
  })
  socket.on('close', () => {
    connections = connections.filter(s => {
      return s !== socket
    })
  })
})
app.listen(8080)
