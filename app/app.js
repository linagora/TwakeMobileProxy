import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import err from './middleware/error.js'
import {routes, allowedMethods} from './middleware/routes.js'
import jwtHandler from './middleware/authorization.js'
import config from 'config'
import SocketProcessor from './common/socket.js'

import WebSocket from 'ws'

const wss = new WebSocket.Server({port: 3124})
wss.on('connection', (ws) => {
  const sp = new SocketProcessor(ws)
  ws.on('message', (message) => sp.onMessage(message))
})


const app = new Koa()

app.use(bodyParser())
app.use(jwtHandler)
app.use(err)
app.use(routes())
app.use(allowedMethods())

app.listen(config.server.port, function() {
  console.log('twake-mobile-app-server listening at port %d', config.server.port)
})
