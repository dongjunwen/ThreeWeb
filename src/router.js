import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, Redirect, routerRedux } from 'dva/router'
import dynamic from 'dva/dynamic'
import App from 'routes/app'

const { ConnectedRouter } = routerRedux

const Routers = function ({ history, app }) {
  const error = dynamic({
    app,
    component: () => import('./routes/error'),
  })
  const routes = [
    {
      path: '/dashboard',
      models: () => [import('./models/dashboard')],
      component: () => import('./routes/dashboard/'),
    }, {
      path: '/login',
      models: () => [import('./models/login')],
      component: () => import('./routes/login/'),
    }, {
      path: '/material',
      component: () => import('./routes/material/'),
    }, {
      path: '/formular',
      component: () => import('./routes/formular/'),
    }, {
      path: '/comp',
      component: () => import('./routes/comp/'),
    }, {
      path: '/depart',
      component: () => import('./routes/system/depart'),
    }, {
      path: '/createOrder',
      component: () => import('./routes/order/createOrder/'),
    }, {
      path: '/orderApply',
      component: () => import('./routes/order/orderApply/'),
    }, {
      path: '/orderAudit',
      component: () => import('./routes/order/orderAudit/'),
    }, {
      path: '/orderList',
      component: () => import('./routes/order/orderList/'),
    }, {
      path: '/deliverCreate',
      component: () => import('./routes/deliverOrder/createOrder/'),
    }, {
      path: '/deliverApply',
      component: () => import('./routes/deliverOrder/deliverApply/'),
    }, {
      path: '/deliverAudit01',
      component: () => import('./routes/deliverOrder/deliverAudit01/'),
    }, {
      path: '/deliverAudit',
      component: () => import('./routes/deliverOrder/deliverAudit/'),
    }, {
      path: '/deliverList',
      component: () => import('./routes/deliverOrder/deliverOrderList/'),
    }, {
      path: '/purchaseCreate',
      component: () => import('./routes/purchase/purchaseCreate/'),
    }, {
      path: '/purchaseApply',
      component: () => import('./routes/purchase/purchaseApply/'),
    }, {
      path: '/purchaseAudit',
      component: () => import('./routes/purchase/purchaseAudit/'),
    }, {
      path: '/purchaseAudit01',
      component: () => import('./routes/purchase/purchaseAudit01/'),
    }, {
      path: '/purchaseQuery',
      component: () => import('./routes/purchase/purchaseList/'),
    }, {
      path: '/returnCreate',
      component: () => import('./routes/returnOrder/returnCreate/'),
    }, {
      path: '/returnApply',
      component: () => import('./routes/returnOrder/returnApply/'),
    }, {
      path: '/returnAudit01',
      component: () => import('./routes/returnOrder/returnAudit01/'),
    }, {
      path: '/returnAudit',
      component: () => import('./routes/returnOrder/returnAudit/'),
    }, {
      path: '/returnList',
      component: () => import('./routes/returnOrder/returnList/'),
    },
    {
      path: '/receiveCreate',
      component: () => import('./routes/receive/receiveCreate/'),
    }, {
      path: '/receiveApply',
      component: () => import('./routes/receive/receiveApply/'),
    }, {
      path: '/receiveAudit01',
      component: () => import('./routes/receive/receiveAudit01/'),
    }, {
      path: '/receiveAudit',
      component: () => import('./routes/receive/receiveAudit/'),
    }, {
      path: '/receiveList',
      component: () => import('./routes/receive/receiveList/'),
    }, {
      path: '/stockVerify',
      component: () => import('./routes/stock/stockVerify'),
    }, {
      path: '/stockVerifyQuery',
      component: () => import('./routes/stock/stockVerifyQuery'),
    }, {
      path: '/stockQuery',
      component: () => import('./routes/stock/stockQuery'),
    }, {
      path: '/workCreate',
      component: () => import('./routes/workingHours/workCreate'),
    }, {
      path: '/workQuery',
      component: () => import('./routes/workingHours/workQuery'),
    }, {
      path: '/workModi',
      component: () => import('./routes/workingHours/workModi'),
    },{
      path: '/userManager',
      component: () => import('./routes/system/userManager'),
    },
    {
      path: '/roleInfo',
      component: () => import('./routes/system//roleInfo'),
    }, {
      path: '/rolePermit',
      component: () => import('./routes/system//rolePermit'),
    },
  ]

  return (
    <ConnectedRouter history={history}>
      <App>
        <Switch>
          <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />
          {
            routes.map(({ path, ...dynamics }, key) => (
              <Route key={key}
                exact
                path={path}
                component={dynamic({
                  app,
                  ...dynamics,
                })}
              />
            ))
          }
          <Route component={error} />
        </Switch>
      </App>
    </ConnectedRouter>
  )
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
