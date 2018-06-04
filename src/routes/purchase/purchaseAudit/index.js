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
            <FormItem label="申购日期" {...formItemRow}>
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
            <FormItem label="采购单号" {...formItemRow}>
              {getFieldDecorator('purNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="客户名称" {...formItemRow}>
              {getFieldDecorator('supplyCompName')(
                <Input />
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
        title: '采购单号',
        dataIndex: 'purNo',
      },
      {
        title: '申购日期',
        dataIndex: 'purDate',
      },
      {
        title: '客户名称',
        dataIndex: 'supplyCompName',
      },
      {
        title: '金额',
        dataIndex: 'purAmt',
        render: text => Math.floor(text * 100) / 100,
      },
      {
        title: '数量',
        dataIndex: 'purNum',
      },
      {
        title: '业务负责人',
        dataIndex: 'respName',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.getOrderDetail(record.purNo)}>查看详情</a>
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
      param.purStatus = 'AUDIT01_SUCCESS';
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/purchase`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list || [],
        total: data.data.total,
        currentPage: data.data.currPage,
      }));
  }

  getOrderDetail(orderNo) {
    request({
      url: `${config.APIV0}/api/purchase/${orderNo}`,
    }).then((res) => {
      this.setState({
        visible: true,
        orderDetail: res.data,
      });
    }).catch(err => console.error(err));
  }

  auditOrders(action, status) {
    request({
      url: `${config.APIV0}/api/purchase/audit`,
      method: 'POST',
      data: {
        auditUserNo: '',
        auditUserName: '',
        auditAction: action,
        auditDesc: this.state.rejectReason,
        orderNos: this.state.selectedRowKeys,
        purStatus: status,
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
        rejectReason: '',
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
          <Button type="primary" onClick={() => this.auditOrders('AUDIT_PASS', 'AUDIT01_SUCCESS')}>终审通过</Button>&emsp;
          <Button type="primary" onClick={() => this.setState({reasonVisible: true})}>拒绝</Button>
        </div>}
        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          rowSelection={rowSelection}
          dataSource={this.state.data}
          rowKey={(record, key) => record.purNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          title="采购单详情"
          visible={visible}
          width="1000px"
          okText={false}
          onCancel={() => this.setState({visible: false})}
          footer={[<Button type="primary" key="cancel" size="large" onClick={() => this.setState({visible: false})}>关闭</Button>]}
        >
          <OrderDetailPage orderDetail={orderDetail} readOnly />
        </Modal>
        <Modal
          title="拒绝采购单"
          visible={reasonVisible}
          onOk={() => this.auditOrders('AUDIT_REFUSE', 'AUDIT01_SUCCESS')}
          onCancel={() => this.setState({reasonVisible: false, rejectReason: ''})}
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
