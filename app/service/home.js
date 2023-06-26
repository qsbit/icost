'use strict';

const { Service } = require('egg');

class HomeService extends Service {
  // 查询用户信息列表
  async userList() {
    const { app } = this;
    const QUERY_STR = 'id, name';
    const sql = `select ${QUERY_STR} from list`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error, 'userInfo-error');
      return null;
    }
  }

  // 新增用户
  async addUser(name) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('list', { name });
      return result;
    } catch (error) {
      console.log(error, 'addUser-error');
      return null;
    }
  }

  // 编辑用户
  async editUser(id, name) {
    const { app } = this;
    try {
      const result = await app.mysql.update('list', { name }, {
        where: {
          id,
        },
      });
      return result;
    } catch (error) {
      console.log(error, 'editUser-error');
      return null;
    }
  }

  // 删除用户
  async deleteUser(id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('list', { id });
      return result;
    } catch (error) {
      console.log(error, 'deleteUser-error');
      return null;
    }
  }
}

module.exports = HomeService;
