'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;

  const _jwt = middleware.jwtErr(app.config.jwt.secret);
  // 默认页，获取用户列表
  router.get('/', controller.user.getUserList);
  // 注册接口
  router.post('/api/user/register', controller.user.register);
  // 登录接口
  router.post('/api/user/login', controller.user.login);
  // 通过用户名获取用户信息
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo);
  // 修改用户信息
  router.post('/api/user/edit_userinfo', _jwt, controller.user.editUserInfo);

  router.get('/api/user/test', _jwt, controller.user.test);
};
