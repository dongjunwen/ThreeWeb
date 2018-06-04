const { config } = require('./common')

const { apiPrefix } = config
let database = [
  {
    id: '1',
    icon: 'laptop',
    name: '管理中心',
    route: '/dashboard',
  },
  {
    id: '8',
    bpid: '1',
    name: '基础资料',
  },
  {
    id: '81',
    bpid: '8',
    mpid: '8',
    name: '物料信息',
    route: '/material',
  },
  {
    id: '82',
    bpid: '8',
    mpid: '8',
    name: '公式信息',
    route: '/formular',
  },
  {
    id: '83',
    bpid: '8',
    mpid: '8',
    name: '公司信息',
    route: '/comp',
  },
  {
    id: '84',
    bpid: '8',
    mpid: '8',
    name: '部门信息',
    route: '/depart',
  },
  {
    id: '9',
    bpid: '1',
    name: '订单中心',
  },
  {
    id: '91',
    bpid: '9',
    mpid: '9',
    name: '创建订单',
    route: '/createOrder',
  },
  {
    id: '92',
    bpid: '9',
    mpid: '9',
    name: '订单初审',
    route: '/orderApply',
  },
  {
    id: '93',
    bpid: '9',
    mpid: '9',
    name: '订单终审',
    route: '/orderAudit',
  },
  {
    id: '94',
    bpid: '9',
    mpid: '9',
    name: '订单查询',
    route: '/orderList',
  },
]

module.exports = {

  [`GET ${apiPrefix}/menus`] (req, res) {
    res.status(200).json(database)
  },
}
