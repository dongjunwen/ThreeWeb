import React from 'react'
import { Table, Form, Row, Col, Input, Button, Modal, DatePicker, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import OrderDetailPage from './orderDetail'

const FormItem = Form.Item;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  componentWillMount() {
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

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="退货日期" {...formItemRow}>
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
            <FormItem label="退货单号" {...formItemRow}>
              {getFieldDecorator('returnNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="供货商" {...formItemRow}>
              {getFieldDecorator('supplyCompName')(
                <Input />
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
        title: '退货单号',
        dataIndex: 'returnNo',
      },
      {
        title: '退货日期',
        dataIndex: 'returnDate',
      },
      {
        title: '供货商',
        dataIndex: 'supplyCompName',
      },
      {
        title: '数量',
        dataIndex: 'returnNum',
      },
      {
        title: '原因',
        dataIndex: 'returnReason',
      },
      {
        title: '审批人',
        dataIndex: 'auditName',
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
          <a onClick={() => this.getOrderDetail(record.returnNo)}>查看详情</a>
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
      param.returnStatus = 'WAIT_AUDIT';
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/return`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list || [],
        total: data.data.total,
        currentPage: data.data.currPage,
      }));
  }

  getOrderDetail(returnNo) {
    request({
      url: `${config.APIV0}/api/return/${returnNo}`,
    }).then((res) => {
      res.data.swReturnDetailResultVoList.forEach((row, index) => {
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
      url: `${config.APIV0}/api/return/audit`,
      method: 'POST',
      data: {
        auditAction: action,
        auditDesc: this.state.rejectReason,
        orderNos: this.state.selectedRowKeys,
        returnStatus: status,
      },
    }).then((res) => {
      notification.success({
        message: '操作成功',
        description: res.message,
      });
      this.getList({});
      this.setState({
        selectedRowKeys: [],
        reasonVisible: false,
      })
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      });
    });
  }

  render () {
    const {visible, orderDetail, selectedRowKeys, reasonVisible, rejectReason} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        {this.state.selectedRowKeys.length > 0 && <div>
          <Button type="primary" onClick={() => this.auditOrders('AUDIT_PASS', 'WAIT_AUDIT')}>初审通过</Button>&emsp;
          <Button type="primary" onClick={() => this.setState({reasonVisible: true})}>拒绝</Button>
        </div>}
        <Table
          bordered
          columns={this.columns}
          rowSelection={rowSelection}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={record => record.returnNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          title="退货单详情"
          visible={visible}
          width="1000px"
          okText={false}
          onCancel={() => this.setState({visible: false})}
          footer={[<Button type="primary" key="cancel" size="large" onClick={() => this.setState({visible: false})}>关闭</Button>]}
        >
          <OrderDetailPage orderDetail={orderDetail} readOnly />
        </Modal>
        <Modal
          title="拒绝退货单"
          visible={reasonVisible}
          onOk={() => this.auditOrders('AUDIT_REFUSE', 'WAIT_AUDIT')}
          onCancel={() => this.setState({reasonVisible: false, rejectReason: undefined})}
        >
          <Input.TextArea autosize={{ minRows: 3 }} value={rejectReason} onChange={e => this.setState({rejectReason: e.target.value})} placeholder="请输入拒绝理由" />
        </Modal>
      </div>
    )
  }
}

OrderListPage.propTypes = {
  dispatch: PropTypes.func,
}
export default OrderListPage
