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
      statusTypes: [{dictCode: 'code', dictDesc: ''}],
    };
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/DELIVER_STATUS`}),
    ]).then((res) => {
      this.setState({
        statusTypes: res[0].data,
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
    const statusOptions = this.state.statusTypes.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="预发货日期" {...formItemRow}>
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
            <FormItem label="发货单号" {...formItemRow}>
              {getFieldDecorator('deliverNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="发货人" {...formItemRow}>
              {getFieldDecorator('sendName')(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="单据状态" {...formItemRow}>
              {getFieldDecorator('deliverStatus', {
                initialValue: this.state.statusTypes[0] && this.state.statusTypes[0].dictCode,
              })(
                <Select allowClear>
                  {statusOptions}
                </Select>
              )}
            </FormItem>
          </Col>
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
        title: '客户名称',
        dataIndex: 'custCompName',
      },
      {
        title: '发货单号',
        dataIndex: 'deliverNo',
      },
      {
        title: '预发货日期',
        dataIndex: 'deliverDate',
      },
      {
        title: '单据状态',
        dataIndex: 'deliverStatusName',
      },
      {
        title: '操作人',
        dataIndex: 'sendName',
      },
      {
        title: '最后审批人',
        dataIndex: 'modiName',
      },
      {
        width: 120,
        title: '审批意见',
        dataIndex: 'auditDesc',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.getOrderDetail(record.deliverNo)}>查看详情</a>
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
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/deliver`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list || [],
        total: data.data.total,
        currentPage: data.data.currPage,
      }));
  }

  getOrderDetail(deliverNo) {
    request({
      url: `${config.APIV0}/api/deliver/${deliverNo}`,
    }).then((res) => {
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
    const {visible, orderDetail, reasonVisible} = this.state;

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        {false && <div>
          <Button type="primary" onClick={() => this.auditOrders('APPLY', 'WAIT_APPLY')}>初审通过</Button>&emsp;
          <Button type="primary" onClick={() => this.auditOrders('CANCEL', 'WAIT_APPLY')}>作废</Button>&emsp;
          <Button type="primary" onClick={() => this.auditOrders('AUDIT_PASS', 'AUDIT01_SUCCESS')}>终审通过</Button>&emsp;
          <Button type="primary" onClick={() => this.setState({reasonVisible: true})}>拒绝</Button>
        </div>}
        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={(record, key) => record.deliverNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          title="发货单详情"
          visible={visible}
          width="1000px"
          okText={false}
          onCancel={() => this.setState({visible: false})}
          footer={[<Button type="primary" key="cancel" size="large" onClick={() => this.setState({visible: false})}>关闭</Button>]}
        >
          <OrderDetailPage orderDetail={orderDetail} readOnly={true} />
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
