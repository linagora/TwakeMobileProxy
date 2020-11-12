import koajwt from 'koa-jwt'
import config from 'config'

// eslint-disable-next-line require-jsdoc
export default async (ctx, next) =>{
  return koajwt({secret: config.jwt.secret}).unless({path: [/^\/authorize/]})
}

