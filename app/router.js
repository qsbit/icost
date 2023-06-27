'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  router.get('/', controller.home.index);
  router.get('/user_list', controller.home.userList);
  router.post('/add_user', controller.home.addUser);
  router.post('/edit_user', controller.home.editUser);
  router.post('/delete_user', controller.home.deleteUser);

  const _jwt = middleware.jwtErr(app.config.jwt.secret);
  router.post('/api/user/register', _jwt, controller.user.register);
  router.post('/api/user/login', _jwt, controller.user.login);
  router.post('/api/user/test', _jwt, controller.user.test);
};
