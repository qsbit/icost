'use strict';

const { Controller } = require('egg');

class userController extends Controller {
  // 注册用户
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    console.log(username, password, 'register');
    if (!username || !password) {
      ctx.body = {
        code: 500,
        message: '账号密码不能为空！',
        data: null,
      };
      return;
    }

    const userInfo = await ctx.service.user.getUserByUsername(username);

    if (userInfo && userInfo?.id) {
      ctx.body = {
        code: 500,
        message: '用户已存在',
        data: null,
      };
      return;
    }

    const defaultAvatar = 'https://d.17win.com/snack/177/pureCost/avatar.webp';
    const defaultSignature = '没有太晚的开始，不如就从今天行动。';
    const result = await ctx.service.user.register({
      username,
      password,
      signature: defaultSignature,
      avatar: defaultAvatar,
      create_time: new Date(),
    });
    console.log(result, 'register-result');

    if (result) {
      ctx.body = {
        code: 200,
        message: '注册成功，请登录。',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        message: '注册失败!',
        data: null,
      };
    }
  }

  // 用户登录
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    const userInfo = await ctx.service.user.getUserByUserName(username);
    if (!userInfo || !userInfo?.id) {
      ctx.body = {
        code: 500,
        message: '用户不存在，请去注册。',
        data: null,
      };
      return;
    }
    if (userInfo && password !== userInfo?.password) {
      ctx.body = {
        code: 500,
        message: '密码错误',
        data: null,
      };
      return;
    }
    const token = app.jwt.sign({
      id: userInfo?.id,
      username: userInfo?.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: { token },
    };

  }

  // 测试通过token解密拿值
  async test() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      message: '成功',
      data: {
        ...decode,
      },
    };
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx } = this;
    const defaultAvatar = 'https://d.17win.com/snack/177/pureCost/avatar.webp';
    const userInfo = await ctx.service.user.getUserByUserName(ctx.decode.username);
    const { id, username, signature, avatar, create_time } = userInfo;
    ctx.body = {
      code: 200,
      msg: '获取用户信息成功',
      data: {
        id,
        username,
        signature: signature || '',
        avatar: avatar || defaultAvatar,
        create_time,
      },
    };
  }
}

module.exports = userController;
