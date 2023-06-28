'use strict';

const { Controller } = require('egg');

class userController extends Controller {
  // 默认页/获取用户列表
  async getUserList() {
    const { ctx } = this;
    const { id, username } = ctx.request.body;
    // 直接将ctx.request.body中的params全部参数当做入参传入
    const result = await ctx.service.user.getUserList({ id, username });
    console.log(result);
    // 处理返回参数
    ctx.body = {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  // 注册用户
  async register() {
    const { ctx } = this;
    // 获取注册是提交的的username和password
    const { username, password } = ctx.request.body;
    console.log(username, password, 'register');
    // 如果没有入参
    if (!username || !password) {
      // 处理返回参数
      ctx.body = {
        code: 500,
        message: '账号密码不能为空！',
        data: null,
      };
      return;
    }

    // 从数据库中是否已存在该用户
    const userInfo = await ctx.service.user.getUserByUserName(username);
    // 如果已存在，则直接抛出异常
    if (userInfo && userInfo?.id) {
      // 处理返回参数
      ctx.body = {
        code: 500,
        message: '用户已存在',
        data: null,
      };
      return;
    }
    // 如果不存在，则进行新增
    const defaultAvatar = 'https://d.17win.com/snack/177/pureCost/avatar.webp';
    const defaultSignature = '没有太晚的开始，不如就从今天行动。';
    // 除username和password外，补充其他默认参数插入数据库
    const result = await ctx.service.user.register({
      username,
      password,
      signature: defaultSignature,
      avatar: defaultAvatar,
      create_time: new Date(),
    });
    console.log(result, 'register-result');
    // 插入数据库成功
    if (result) {
      // 处理返回参数
      ctx.body = {
        code: 200,
        message: '注册成功，请登录。',
        data: null,
      };
    } else {
      // 处理返回参数
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
    // 先通过username判断用户是否存在
    const userInfo = await ctx.service.user.getUserByUserName({ username });
    if (!userInfo || !userInfo?.id) {
      // 处理返回参数
      ctx.body = {
        code: 500,
        message: '用户不存在，请去注册。',
        data: userInfo,
      };
      return;
    }
    // 若用户存在，但是用户对应的password不对，则返回
    if (userInfo && password !== userInfo?.password) {
      // 处理返回参数
      ctx.body = {
        code: 500,
        message: '密码错误',
        data: null,
      };
      return;
    }
    // 用户存在且密码正确，获取该用户的token
    const token = app.jwt.sign({
      id: userInfo?.id,
      username: userInfo?.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }, app.config.jwt.secret);
    // 处理返回token
    ctx.body = {
      code: 200,
      message: '登录成功',
      data: { token },
    };

  }

  // 测试通过token解密拿值
  async test() {
    const { ctx, app } = this;
    // 在request的header种获取authorization
    const token = ctx.request.header.authorization;
    // 通过jwt.verify去解密token，获取id和username以及有效期
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    // 处理返回解密后的decode
    ctx.body = {
      code: 200,
      message: '成功',
      data: decode,
    };
  }

  // 通过用户名获取用户信息
  async getUserInfo() {
    const { ctx } = this;
    const defaultAvatar = 'https://d.17win.com/snack/177/pureCost/avatar.webp';
    // 通过用户名，在数据库中查询用户信息
    const userInfo = await ctx.service.user.getUserByUserName(ctx.decode.username);
    const { id, username, signature, avatar, create_time } = userInfo;
    // 组装返回数据
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
