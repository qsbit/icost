'use strict';

const { Controller } = require('egg');

class billController extends Controller {
  // 新增账单
  async addBill() {
    const { ctx } = this;
    // 获取请求中携带的参数
    const { amount, type_id, type_name, pay_type, create_time = new Date(), remark = '' } = ctx.request.body;
    // 判断是否有空值，前端需要处理，后端做一层兜底方案
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        message: '参数错误（有空值）',
        data: null,
      };
      return;
    }

    // 如果用户未登录，直接返回
    if (!ctx.decode) return;
    // 如果登录，获取登录用户的id和username
    const { id, username } = ctx.decode;

    try {
      // 去service层忘数据库加数据
      const result = ctx.service.bill.addBill(
        {
          amount,
          type_id,
          type_name,
          create_time,
          pay_type,
          remark,
          user_id: id,
        }
      );
      console.log('addBill-result', result);
      // 账单成功添加
      ctx.body = {
        code: 200,
        message: '新增账单成功',
        data: {
          user_id: id,
          username,
          ...ctx.request.body,
        },
      };
    } catch (error) {
      // 账单新增失败
      console.log('addBill-error', error);
      ctx.body = {
        code: 500,
        message: '账单新增失败',
        data: null,
      };
    }
  }
}

module.exports = billController;
