'use strict';

const { Service } = require('egg');

class userService extends Service {
  // 查询用户信息列表
  async userList() {
    const { app } = this;
    try {
      const result = await app.mysql.select('user');
      return result;
    } catch (error) {
      console.log(error, 'userInfo-error');
      return null;
    }
  }

  // 通过username查询用户信息
  async getUserByUserName(username) {
    const { app } = this;
    try {
      const result = await app.mysql.select('user', { username });
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
