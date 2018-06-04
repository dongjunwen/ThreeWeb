import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, DatePicker, Popconfirm, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import OrderDetailPage from './orderDetail'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderTypes: [{dictCode: 'code', dictDesc: ''}],
      saleTypes: [{dictCode: 'code', dictDesc: ''}],
      statusTypes: [{dictCode: 'code', dictDesc: ''}],
    };
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/ORDER_TYPE`}),
      request({url: `${config.APIV0}/api/sysDict/SALE_TYPE`}),
      request({url: `${config.APIV0}/api/sysDict/ORDER_STATUS`}),
    ]).then((res) => {
      this.setState({
        orderTypes: res[0].data,
        saleTypes: res[1].data,
        statusTypes: res[2].data,
      });
    }).catch((err) => {
      notification.error({
        message: '页面加载错误',
        description: '获取类型选项失败',
      });
      console.warn(err);
    })
    this.props.search({});
  }

  handleSearch(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        // dddd
      } else {
        // 验证通过
        values.startTime = values.startTime ? values.startTime.format('YYYY-MM-DD') : undefined;
        values.endTime = values.endTime ? values.endTime.format('YYYY-MM-DD') : undefined;
        this.props.search(values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const orderOptions = this.state.orderTypes.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);
    const saleOptions = this.state.saleTypes.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);
    const statusOptions = this.state.statusTypes.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="订单日期" {...formItemRow}>
              {getFieldDecorator('startTime')(
                <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="~" {...formItemRow} colon={false}>
              {getFieldDecorator('endTime')(
                <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="订单号" {...formItemRow}>
              {getFieldDecorator('orderNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="客户名称" {...formItemRow}>
              {getFieldDecorator('custContactName')(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="单据类型" {...formItemRow}>
              {getFieldDecorator('orderType', {
                initialValue: this.state.orderTypes[0].dictCode,
              })(
                <Select>
                  {orderOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="销售类型" {...formItemRow}>
              {getFieldDecorator('saleType', {
                initialValue: this.state.saleTypes[0].dictCode,
              })(
                <Select>
                  {saleOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            &emsp;<Button type="primary" htmlType="submit">查询</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

class OrderListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      visible: false,
      dataDetail: {},
      currentPage: 1,
      pageSize: 10,
      data: [],
      orderDetail: {},
      reasonVisible: false,
      rejectReason: undefined,
    };
    this.columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
      },
      {
        title: '客户名称',
        dataIndex: 'custCompName',
      },
      {
        title: '订单日期',
        dataIndex: 'goodDate',
      },
      {
        title: '单据类型',
        dataIndex: 'orderTypeName',
      },
      {
        title: '销售类型',
        dataIndex: 'saleTypeName',
      },
      {
        title: '单据状态',
        dataIndex: 'orderStatusName',
      },
      {
        title: '创建人',
        dataIndex: 'createName',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.getOrderDetail(record.orderNo)}>查看详情</a>
        </div>),
      },
    ];
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows.map(item => item.orderNo));
    this.setState({ selectedRowKeys });
  }

  getList(param = {}) {
    const query = {};
    Object.assign(query, { currPage: this.state.currentPage, pageSize: this.state.pageSize });
    if (typeof param !== 'number') {
      param.orderStatus = 'WAIT_APPLY';
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/order`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list || [],
        total: data.data.total,
        currentPage: data.data.currPage,
      }));
  }

  getOrderDetail(orderNo) {
    request({
      url: `${config.APIV0}/api/order/${orderNo}`,
    }).then((res) => {
      res.data.swORderDetailResultVos.forEach((row, index) => {
        row.key = `${index + 1}`;
      });
      this.setState({
        visible: true,
        orderDetail: res.data,
      });
    }).catch(err => console.error(err));
  }

  auditOrders(action, status) {
    request({
      url: `${config.APIV0}/api/order/audit`,
      method: 'POST',
      data: {
        auditAction: action,
        auditDesc: this.state.rejectReason,
        orderNos: this.state.selectedRowKeys,
        orderStatus: status,
      },
    }).then((res) => {
      notification.success({
        message: '操作成功',
        description: res.message,
      });
      this.getList({});
      this.setState({
        selectedRowKeys: [],
      })
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      });
    });
  }

  render () {
    const {visible, orderDetail, selectedRowKeys, rejectReason, reasonVisible} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        {this.state.selectedRowKeys.length > 0 && <div>
          <Button type="primary" onClick={() => this.auditOrders('APPLY', 'WAIT_APPLY')}>初审通过</Button>&emsp;
          <Button type="primary" onClick={() => this.auditOrders('CANCEL', 'WAIT_APPLY')}>作废</Button>&emsp;
        </div>}
        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          rowSelection={rowSelection}
          dataSource={this.state.data}
          rowKey={(record, key) => record.orderNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          title="订单详情"
          visible={visible}
          width="1000px"
          okText={false}
          onCancel={() => this.setState({visible: false})}
          footer={[<Button type="primary" key="cancel" size="large" onClick={() => this.setState({visible: false})}>关闭</Button>]}
        >
          <OrderDetailPage orderDetail={orderDetail} readOnly={false} />
        </Modal>
        <Modal
          visible={reasonVisible}
          onOk={() => this.auditOrders('AUDIT_REFUSE', 'AUDIT01_SUCCESS')}
          onCancel={() => this.setState({reasonVisible, rejectReason: undefined})}
        >
          <Input placeholder="请输入拒绝理由" />
        </Modal>
      </div>
    )
  }
}

OrderListPage.propTypes = {
  dispatch: PropTypes.func,
}
export default OrderListPage
