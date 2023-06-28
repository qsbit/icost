'use strict';

const { Service } = require('egg');

class billService extends Service {
  // 新增账单
  async addBill(params) {
    const { ctx } = this;
    try {
      // 向bill表中插入账单数据
      const result = ctx.app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log('addBill-error', error);
      return null;
    }
  }

}

module.exports = billService;
