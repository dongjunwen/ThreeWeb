import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, DatePicker, Popconfirm, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }
class OrderListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      dataDetail: {},
      currentPage: 1,
      pageSize: 10,
      data: [],
      orderDetail: {},
      reasonVisible: false,
      rejectReason: undefined,
      statusTypes: [{dictCode: 'code', dictDesc: ''}],
    };
    this.columns = [
      {
        title: '采购单号',
        dataIndex: 'purNo',
      },
      {
        title: '序号',
        dataIndex: 'purSeqNo',
      },
      {
        title: '订单号',
        dataIndex: 'orderNo',
      },
      {
        title: '订单序号',
        dataIndex: 'orderSeqNo',
      },
      {
        title: '品名',
        dataIndex: 'materialName',
      },
      {
        title: '规格',
        dataIndex: 'spec',
      },
      {
        title: '型号',
        dataIndex: 'pattern',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        title: '数量',
        dataIndex: 'num',
      },
      {
        title: '单价',
        dataIndex: 'price',
      },
      {
        title: '备注',
        dataIndex: 'memo',
      },
    ];
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows.map(item => item.orderNo));
    this.setState({ selectedRowKeys, selectedRows });
  }

  getList(param = {}) {
    const query = {};
    Object.assign(query, { currPage: this.state.currentPage, pageSize: this.state.pageSize });
    if (typeof param !== 'number') {
      query.purNo = param.purNo;
      query.supplyCompNo = this.props.custCompNo;
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/purchase/findDetailList`, data: this.condition })
      .then(data => this.setState({
        data: data.data.list || [],
        total: data.data.total,
        currentPage: data.data.currPage,
      }));
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
        this.getList(values);
      }
    });
  }

  selectOrders = () => {
    this.props.form.resetFields();
    this.props.selectOrders(this.state.selectedRows);
    this.setState({selectedRows: [], selectedRowKeys: []});
  }

  render () {
    const {visible, orderDetail, selectedRowKeys, selectedRows, reasonVisible} = this.state;
    const { getFieldDecorator } = this.props.form;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div className="content-inner">
        <Form
          layout="horizontal"
          onSubmit={this.handleSearch.bind(this)}
        >
          <Row>
            <Col span={8}>
              <FormItem label="申购日期" {...formItemRow}>
                {getFieldDecorator('startTime')(
                  <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="~" {...formItemRow} colon={false}>
                {getFieldDecorator('endTime')(
                  <DatePicker style={{width: '100%'}} format={'YYYY-MM-DD'} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="采购单号" {...formItemRow}>
                {getFieldDecorator('purNo')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              &emsp;<Button type="primary" htmlType="submit">查询</Button>
            </Col>
          </Row>
        </Form>
        {selectedRows.length > 0 && <Button style={{margin: '10px 0'}} onClick={this.selectOrders} type="primary">确定</Button>}
        <Table
          bordered
          scroll={{x: 1100}}
          columns={this.columns}
          rowSelection={rowSelection}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={record => `${record.purNo} ${record.purSeqNo}`}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
      </div>
    )
  }
}


OrderListPage = Form.create({})(OrderListPage);

OrderListPage.propTypes = {
  dispatch: PropTypes.func,
}
export default OrderListPage
