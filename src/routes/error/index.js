import React from 'react'
import { Icon } from 'antd'
import styles from './index.less'

const Error = () => (<div className="content-inner">
  <div className={styles.error}>
    <Icon type="frown-o" />
    <h1>未找到你查看的页面</h1>
  </div>
</div>)

export default Error
