import Router from '@koa/router'
import Authorization from '../controllers/authorization.js'
import Users from '../controllers/users.js'
import Channels from '../controllers/channels.js'
import Messages from '../controllers/messages.js'
import {websocketUsersCache} from '../common/simplecache.js'

const router = new Router()

router
    .post('/authorize', async (ctx, next) => {
      ctx.assert(ctx.request.body.username, 400, 'username is required')
      ctx.assert(ctx.request.body.password, 400, 'password is required')
      ctx.assert(ctx.request.body.device, 400, 'device is required: \'apple\' | \'android\'')
      ctx.body = await new Authorization(null).auth(ctx.request.body)
    })
    .get('/users/current/get', async (ctx) => {
      const timeZoneOffset = ctx.request.query.timezoneoffset
      ctx.assert(timeZoneOffset, 400, 'timezoneoffset is required')
      ctx.assert(!isNaN(+timeZoneOffset), 400, 'timezone should be numeric (i.e. -180 for Moscow)')
      ctx.body = await new Users(ctx.state.user).getCurrent(timeZoneOffset)
    })
    .get('/workspace/:workspace_id/channels', async (ctx) => {
      ctx.body = await new Channels(ctx.state.user).listPublic(ctx.params.workspace_id)
    })
    .get('/channels/:channel_id/messages/init', async (ctx) => {
      ctx.body = await new Messages(ctx.state.user).init(ctx.params.channel_id)
    })
    .get('/channels/:channel_id/messages', async (ctx) => {
      ctx.body = await new Messages(ctx.state.user).get(ctx.params.channel_id, ctx.request.query.limit, ctx.request.query.before)
    })
    .post('/channels/:channel_id/message', async (ctx) => {
      ctx.body = await new Messages(ctx.state.user).update(ctx.params.channel_id, ctx.request.body)
    })
    .get('/authorize/test', async (ctx) =>{
      console.log('cache', websocketUsersCache)

      Object.keys(websocketUsersCache).forEach((k)=>{
        websocketUsersCache[k].send('message', {'sender': 'anonymous', 'text': 'hello'})
      })

      ctx.body = Object.keys(websocketUsersCache)
    })

// eslint-disable-next-line require-jsdoc
export function routes() {
  return router.routes()
}

// eslint-disable-next-line require-jsdoc
export function allowedMethods() {
  return router.allowedMethods()
}
