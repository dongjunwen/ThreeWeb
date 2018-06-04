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
      request({url: `${config.APIV0}/api/sysDict/PAY_STATUS`}),
    ]).then((res) => {
      this.setState({
        statusTypes: res[0].data
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
            <FormItem label="付款时间" {...formItemRow}>
              {getFieldDecorator('tradeBeginDate')(
                <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="~" {...formItemRow} colon={false}>
              {getFieldDecorator('tradeEndDate')(
                <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="商户订单号" {...formItemRow}>
              {getFieldDecorator('merOrderNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="商户号" {...formItemRow}>
              {getFieldDecorator('merNo')(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>

        <Row>
        <Col span={6}>
            <FormItem label="支付交易号" {...formItemRow}>
              {getFieldDecorator('payTradeNo')(
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
        title: '商户订单号',
        dataIndex: 'merOrderNo',
      },
      {
        title: '商户名称',
        dataIndex: 'merName',
      },
      {
        title: '支付交易号',
        dataIndex: 'tradeNo',
      },
      {
        title: '付款日期',
        dataIndex: 'payTime',
      },
      {
        title: '付款金额',
        dataIndex: 'payAmt',
      },
      {
        title: '设备ip',
        dataIndex: 'equipIp',
      },
      {
        title: '付款状态',
        dataIndex: 'payStatusName',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.getOrderDetail(record.merOrderNo)}>查看详情</a>
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
    request({ url: `${config.APIV1}/admin/order/findPage`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.content || [],
        total: data.data.totalElements,
        currentPage: data.data.number,
      })
    ).catch((err) => {
      notification.error({
        message: '页面加载错误',
        description: '获取数据列表失败',
      });
      console.warn(err);
    })
  }

  render () {
    const {visible, orderDetail, reasonVisible} = this.state;

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />

        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={(record, key) => record.orderNo}
          pagination={
            { pageSize: this.state.pageSize,
              onChange: this.getList.bind(this),
               defaultCurrent: 1,
               current: this.state.currentPage,
                total: this.state.total ,
                pageSizeOptions:['10','50', '100', '150']
              }
          }
        />
        <Modal
          title="订单详情"
          visible={visible}
          width="1000px"
          okText={false}
          onCancel={() => this.setState({visible: false})}
          footer={[<Button type="primary" key="cancel" size="large" onClick={() => this.setState({visible: false})}>关闭</Button>]}
        >
          <OrderDetailPage orderDetail={orderDetail} readOnly />
        </Modal>

      </div>
    )
  }
}

OrderListPage.propTypes = {
  dispatch: PropTypes.func,
}
export default OrderListPage
