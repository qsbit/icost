'use strict';

const { Controller } = require('egg');

class HomeController extends Controller {
  // 默认页
  async index() {
    const { ctx } = this;
    const { id } = ctx.query;
    ctx.body = id;
  }

  // 获取用户信息Service接口
  async userList() {
    const { ctx } = this;
    const result = await ctx.service.home.userList();
    ctx.body = result;
  }

  // 新增用户
  async addUser() {
    const { ctx } = this;
    const { name } = ctx.request.body;
    try {
      const result = await ctx.service.home.addUser(name);
      console.log(result, 'addUser-result');
      ctx.body = {
        code: 200,
        message: '新增成功！',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: '新增失败！',
        data: null,
      };
    }
  }

  // 编辑用户
  async editUser() {
    const { ctx } = this;
    const { id, name } = ctx.request.body;
    try {
      const result = await ctx.service.home.editUser(id, name);
      console.log(result, 'editUer-result');
      ctx.body = {
        code: 200,
        message: '修改成功！',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: '修改失败！',
        data: null,
      };
    }
  }

  // 删除用户
  async deleteUser() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    try {
      const result = await ctx.service.home.deleteUser(id);
      console.log(result, 'deleteUser-result');
      ctx.body = {
        code: 200,
        message: '删除成功！',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: '删除失败',
        data: null,
      };
    }
  }
}

module.exports = HomeController;
