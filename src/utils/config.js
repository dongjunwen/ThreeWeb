const APIV0 = 'http://111.231.141.23:8081'
const APIV1 = 'http://111.231.141.23:9001'
const APIV2 = '/api/v2'

module.exports = {
  name: '三人行支付后台',
  prefix: 'threepayAdmin',
  footerText: '三人行支付后台管理系统  © 2017 Penpo',
  logo: './logo.png',
  iconFontCSS: './iconfont.css',
  baseURL: './',
  iconFontJS: './iconfont.js',
  CORS: [APIV0,APIV1,APIV2],
  openPages: ['/login'],
  apiPrefix: '/api/v1',
  APIV0,
  APIV1,
  APIV2,
  api: {
    userLogin: `${APIV0}/api/login`,
    userLogout: `${APIV0}/api/logout`,
    userInfo: `${APIV0}/api/getCurrentUser`,
    users: `${APIV1}/users`,
    posts: `${APIV1}/posts`,
    user: `${APIV1}/user/:id`,
    dashboard: `${APIV1}/dashboard`,
    menus: `${APIV0}/api/sysResource/currentUser`,
    weather: `${APIV1}/weather`,
    v1test: `${APIV1}/test`,
    v2test: `${APIV2}/test`,
  },
}
