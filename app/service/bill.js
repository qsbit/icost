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

  // 获取账单列表
  async list(id) {
    const { app } = this;
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${id} AND is_deleted = '0'`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取账单详情
  async detail(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id, is_deleted: '0' });
      console.log(result, 'result');
      return result;
    } catch (error) {
      console.log('detail-error');
      return null;
    }
  }

  // 编辑账单信息（包括删除账单：逻辑删除）
  async update(params) {
    const { app } = this;
    try {
      const result = await app.mysql.update('bill', {
        ...params,
      }, {
        id: params?.id,
        user_id: params?.user_id,
      });
      return result;
    } catch (error) {
      console.log('update-error', error);
      return null;
    }
  }

}

module.exports = billService;
