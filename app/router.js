'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;

  // 中间件-登录态校验
  const _jwt = middleware.jwtErr(app.config.jwt.secret);

  // ------------用户部分----------------
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
  // 测试通过token拿数据
  router.get('/api/user/test', _jwt, controller.user.test);

  // ------------账单部分----------------
  // 新增账单
  router.post('/api/bill/add_bill', _jwt, controller.bill.addBill);
  // 获取账单列表
  router.get('/api/bill/list', _jwt, controller.bill.list);
  // 获取账单详情
  router.get('/api/bill/detail', _jwt, controller.bill.detail);
  // 更新账单信息
  router.post('/api/bill/update', _jwt, controller.bill.update);
  // 删除某条账单
  router.post('/api/bill/delete', _jwt, controller.bill.delete);
};
