'use strict';

const { Controller } = require('egg');
const moment = require('moment');

class billController extends Controller {
  // 新增账单
  async addBill() {
    const { ctx } = this;
    // 获取请求中携带的参数
    const { amount, type_id, type_name, pay_type, date = new Date(), remark = '' } = ctx.request.body;

    // 如果用户未登录，直接返回
    if (!ctx.decode) return;

    // 如果登录，获取登录用户的id和username
    const { id, username } = ctx.decode;
    // 判断是否有空值，前端需要处理，后端做一层兜底方案
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        message: '参数错误（有空值）',
        data: null,
      };
      return;
    }

    try {
      // 去service层往数据库加数据
      const result = ctx.service.bill.addBill(
        {
          amount,
          type_id,
          type_name,
          date,
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

  // 查询账单列表
  async list() {
    const { ctx } = this;
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;

    // 如果用户未登录，直接返回
    if (!ctx.decode) {
      ctx.body = {
        code: 403,
        message: '未登录！',
        data: null,
      };
      return;
    }

    // 判断是否有空值，前端需要处理，后端做一层兜底方案
    if (!page || !page_size || !type_id || !date) {
      ctx.body = {
        code: 400,
        message: '参数错误（有空值）',
        data: null,
      };
      return;
    }

    try {
      // 如果登录，获取登录用户的id
      const { id: userId } = ctx.decode;
      // 拿到当前用户的账单列表
      const list = await ctx.service.bill.list(userId);
      // 过滤出月份和类型所对应的账单列表
      const _list = list?.filter(item => {
        if (type_id !== 'all') {
          return moment(Number(item.date)).format('YYYY-MM') === date && type_id === item.type_id;
        }
        return moment(Number(item.date)).format('YYYY-MM') === date;
      });
      // 格式化数据，将其变成我们之前设置好的对象格式
      const listMap = _list.reduce((curr, item) => {
        // curr 默认初始值是一个空数组 []
        // 把第一个账单项的时间格式化为 YYYY-MM-DD
        const date = moment(Number(item.date)).format('YYYY-MM-DD');
        // 如果能在累加的数组中找到当前项日期 date，那么在数组中的加入当前项到 bills 数组。
        if (curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
          const index = curr.findIndex(item => item.date === date);
          curr[index].bills.push(item);
        }
        // 如果在累加的数组中找不到当前项日期的，那么再新建一项。
        if (curr && curr.length && curr.findIndex(item => item.date === date) === -1) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
        if (!curr.length) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        return curr;
      }, []).sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间约新的，在越上面

      // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      const __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM') === date);
      // 累加计算支出
      const totalExpense = __list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 累加计算收入
      const totalIncome = __list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);

      // 返回数据
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }

  // 查询账单详情
  async detail() {
    const { ctx } = this;

    // 如果用户未登录，直接返回
    if (!ctx.decode) {
      ctx.body = {
        code: 403,
        message: '未登录！',
        data: null,
      };
      return;
    }

    // 获取账单id的参数
    const { id = '' } = ctx.query;

    // 判断是否传入账单 id
    if (!id) {
      ctx.body = {
        code: 500,
        msg: '订单id不能为空',
        data: null,
      };
      return;
    }

    try {
      const { id: userId } = ctx?.decode;
      const detail = await ctx.service.bill.detail(id, userId);
      console.log(detail, '查询账单详情--');
      ctx.body = {
        code: 200,
        msg: '查询成功！',
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '查询失败！',
        data: null,
      };
    }

  }

  // 修改账单信息
  async update() {
    const { ctx } = this;

    // 如果用户未登录，直接返回
    if (!ctx.decode) {
      ctx.body = {
        code: 403,
        message: '未登录！',
        data: null,
      };
      return;
    }

    // 获取用户id
    const { id: user_id } = ctx.decode;

    // 获取账单id的参数
    const { id = '', amount, pay_type, type_id, type_name, date, remark = '' } = ctx.request.body;

    // 判断是否传入账单 id
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 500,
        msg: '参数错误',
        data: null,
      };
      return;
    }

    try {
      const result = await ctx.service.bill.update({
        id, // 账单id
        amount, // 账单金额
        pay_type, // 消费类型
        type_id, // 账单类型id（1：餐饮）
        type_name, // 账单类型name
        date, // 日期
        remark, // 备注
        user_id, // 用户id
      });
      ctx.body = {
        code: 200,
        msg: '修改成功',
        data: result,
      };
    } catch (error) {
      console.log('update_error', error);
    }
  }

  // 删除账单
  // 正常操作是（逻辑删除）在数据库中修改is_deleted的值
  async delete() {
    const { ctx } = this;

    // 如果用户未登录，直接返回
    if (!ctx.decode) {
      ctx.body = {
        code: 403,
        message: '未登录！',
        data: null,
      };
      return;
    }

    // 获取用户id
    const { id: userId } = ctx.decode;

    // 获取要删除的账单id参数
    const { id = '' } = ctx.request.body;

    // 获取账单详情
    const detail = await ctx.service.bill.detail(id, userId);

    try {
      const result = await ctx.service.bill.update({ ...detail, is_deleted: '1' });
      ctx.body = {
        code: 200,
        msg: '删除成功！',
        data: result,
      };
    } catch (error) {
      console.log('delete_error', error);
      ctx.body = {
        code: 500,
        msg: '删除失败',
        data: null,
      };
    }
  }

  // 获取定制化数据格式（根据查询的月份时间筛选账单）
  async getData() {
    const { ctx } = this;

    // 如果用户未登录，直接返回
    if (!ctx.decode) {
      ctx.body = {
        code: 403,
        message: '未登录！',
        data: null,
      };
      return;
    }

    // 获取筛选的月份入参
    const { date = '' } = ctx.query;

    // 获取用户id
    const { id: userId } = ctx.decode;

    try {
      // 获取账单用户下的账单列表
      const list = await ctx.service.bill.list(userId);
      // 根据时间参数，筛选出当月所有的账单数据
      const start = moment(date).startOf('month').unix() * 1000; // 选择月份，月初时间
      const end = moment(date).endOf('month').unix() * 1000; // 选择月份，月末时间
      const _list = list?.filter(item => (Number(item.date) > start && Number(item.date) < end));

      // 计算总支出
      const total_expense = _list.reduce((arr, cur) => {
        if (cur.pay_type === 1) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);

      // 计算总收入
      const total_income = _list.reduce((arr, cur) => {
        if (cur?.pay_type === 2) {
          arr += Number(cur?.amount);
        }
        return arr;
      }, 0);

      // 获取收支构成
      let total_data = _list.reduce((arr, cur) => {
        const index = arr.findIndex(item => item.type_id === cur.type_id);
        // 如果不存在该月的账单数据，则新增一条
        if (index === -1) {
          arr.push({
            type_id: cur.type_id,
            type_name: cur.type_name,
            pay_type: cur.pay_type,
            number: Number(cur.amount),
          });
        }
        // 如果已存在当月该类型的账单数据，则进行类增
        if (index > -1) {
          arr[index].number += Number(cur.amount);
        }
        return arr;
      }, []);

      total_data = total_data.map(item => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });

      ctx.body = {
        code: 200,
        msg: '查询成功！',
        data: {
          total_data: total_data || [],
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
        },
      };

    } catch (error) {
      console.log('getData-error', error);
      ctx.body = {
        code: 500,
        msg: '查询失败！',
        data: null,
      };
    }
  }

}

module.exports = billController;
