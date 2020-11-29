/* global screen */

import Mai5Server from 'mai5-server'

const server = new Mai5Server()
server.onConnect = () => {
  trace('connected\n')
}
server.onDisconnect = () => {
  trace('disconnected\n')
}
