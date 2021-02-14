const Express = require('express')
const app = Express()
require('express-ws')(app)

const PORT = 8080
let sockets = []

// publicディレクトリ配下を配信する
app.use(Express.static('public'))

// WebSocketエンドポイントの設定
app.ws('/', function (socket) {
  sockets.push(socket)

  socket.on('message', function (message) {
    // 他のコネクションにメッセージを送る
    sockets.forEach(s => {
      s.send(message)
    })
  })

  socket.on('close', () => {
    // 閉じたコネクションを取り除く
    sockets = sockets.filter(s => {
      return s !== socket
    })
  })
})
// ポート8080で接続を待ち受ける
app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`)
})
