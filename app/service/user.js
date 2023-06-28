'use strict';

const { Service } = require('egg');

class userService extends Service {
  // 查询用户信息列表
  async getUserList(params) {
    const { app } = this;
    try {
      // 生成合适的sql语句
      const generateSql = params => {
        const { id, username } = params;
        const _id = id ? `id=${id} and` : '';
        const _username = username ? `username='${username}'` : '';
        // 如果条件都没传，则全查
        if (!_id && !_username) return 'select * from user';
        // 有条件则按照条件查询
        return `select * from user where ${_id} ${_username}`;
      };
      // mysql.query可以用来写自定义sql语句
      // mysql.select查多条数据，返回Array
      // mysql.get用来查单条数据，返回Object
      const result = await app.mysql.query(generateSql(params));
      return result;
    } catch (error) {
      console.log(error, 'userInfo-error');
      return null;
    }
  }

  // 通过username查询单条用户信息
  async getUserByUserName(username) {
    const { app } = this;
    try {
      // mysql.select查多条数据，返回Array
      // mysql.get用来查单条数据，返回Object
      const result = await app.mysql.get('user', { username });
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
      // 通过mysql.insert往数据库中插入数据
      const result = await app.mysql.insert('user', params);
      return result;
    } catch (error) {
      console.log(error, 'register-error');
      return null;
    }
  }

}

module.exports = userService;
