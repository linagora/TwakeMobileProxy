export default async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // will only respond with JSON
    console.log(err)
    ctx.status = err.statusCode || err.status || 500
    ctx.body = {
      error: err.originalError ? err.originalError.message : err.message,
    }
  }
}

