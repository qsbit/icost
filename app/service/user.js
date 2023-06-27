'use strict';

const { Service } = require('egg');

class userService extends Service {
  // 通过username查询用户信息
  async getUserByUserName(username) {
    const { app } = this;
    try {
      const result = app.mysql.get('user', { username });
      return result;
    } catch (error) {
      console.log(error, 'getUserByUserName-error');
      return null;
    }
  }

  // 用户注册
  async register(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('user', params);
      return result;
    } catch (error) {
      console.log(error, 'register-error');
      return null;
    }
  }

}

module.exports = userService;
