'use strict';

module.exports = secret => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.authorization;
    if (token && token !== 'null') {
      try {
        ctx.decode = ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        console.log(error, 'jwtErr-error');

        ctx.status = 200;

        ctx.body = {
          message: 'token已过期,请重新登陆。',
          code: 401,
        };

        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: 'token不存在',
      };
      return;
    }
  };
};
