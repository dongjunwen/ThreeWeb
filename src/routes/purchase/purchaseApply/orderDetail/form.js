import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, DatePicker, notification } from 'antd'
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
      dataDetail: {},
      currentPage: 1,
      pageSize: 10,
      data: [],
      rejectReason: undefined,
      orderTypes: [{dictCode: 'code', dictDesc: ''}],
      statusTypes: [{dictCode: 'code', dictDesc: ''}],
    };
    this.columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
      },
      {
        title: '序号',
        dataIndex: 'orderSeqNo',
      },
      {
        title: '品名',
        dataIndex: 'prodName',
      },
      {
        title: '品种',
        dataIndex: 'prodType',
      },
      {
        title: '形状',
        dataIndex: 'prodForm',
      },
      {
        title: '长',
        dataIndex: 'prodLong',
      },
      {
        title: '宽',
        dataIndex: 'prodWidth',
      },
      {
        title: '工艺名称',
        dataIndex: 'techName',
      },
      {
        title: '单位',
        dataIndex: 'prodUnit',
      },
      {
        title: '数量',
        dataIndex: 'prodNum',
      },
      {
        title: '单价',
        dataIndex: 'prodPrice',
      },
      {
        title: '金额',
        dataIndex: 'prodAmt',
        render: text => Math.floor(text * 100) / 100,
      },
      {
        title: '区域',
        dataIndex: 'area',
      },
      {
        title: '面料品号',
        dataIndex: 'materialNo',
      },
      {
        title: '面料品名',
        dataIndex: 'materialName',
      },
      {
        title: '有效幅宽',
        dataIndex: 'materialWidth',
      },
      {
        title: '面料公式代码',
        dataIndex: 'materialPriceNo',
      },
      {
        title: '面料公式名称',
        dataIndex: 'materialPriceName',
      },
      {
        title: '面料公式',
        dataIndex: 'materialPriceExpress',
      },
      {
        title: '面料需求',
        dataIndex: 'materialNum',
      },
      {
        title: '面料基础价',
        dataIndex: 'materialPrice',
      },
      {
        title: '工艺代码',
        dataIndex: 'techNo',
      },
      {
        title: '是否定价品',
        dataIndex: 'ifProd',
      },
      {
        title: '分类',
        dataIndex: 'cateType',
      },
      {
        title: '备注',
        dataIndex: 'memo',
      },
    ];
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/ORDER_TYPE`}),
    ]).then((res) => {
      this.setState({
        orderTypes: res[0].data,
      });
    }).catch(() => {
      notification.error({
        message: '页面加载错误',
        description: '获取类型选项失败',
      });
    })
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows.map(item => item.purNo));
    this.setState({ selectedRowKeys, selectedRows });
  }

  getList(param = {}) {
    const query = {};
    Object.assign(query, { currPage: this.state.currentPage, pageSize: this.state.pageSize });
    if (typeof param !== 'number') {
      query.orderStatus = 'AUDIT_SUCCESS';
      query.purNo = param.purNo;
      query.orderType = param.orderType;
      query.supplyCompNo = this.props.supplyCompNo;
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/order/findDetailList`, data: this.condition })
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
    const {selectedRows} = this.state;
    // 字段映射替换
    this.props.form.resetFields();
    selectedRows.forEach((row) => {
      [row.materialType, row.materialNo,row.materialLong, row.materialWidth, row.spec, row.pattern, row.unit, row.num, row.price, row.amt] = [row.prodType,row.prodNo, row.prodLong, row.prodWidth, row.spec, row.pattern, row.unit, row.prodNum, row.prodPrice, row.prodAmt];
    })
    this.props.selectOrders(selectedRows);
    this.setState({selectedRows: [], selectedRowKeys: []});
  }

  render () {
    const {selectedRowKeys, selectedRows} = this.state;
    const { getFieldDecorator } = this.props.form;
    const orderOptions = this.state.orderTypes.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);
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
              <FormItem label="订单日期" {...formItemRow}>
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
              <FormItem label="订单号" {...formItemRow}>
                {getFieldDecorator('orderNo')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="单据类型" {...formItemRow}>
                {getFieldDecorator('orderType', {
                  initialValue: this.state.orderTypes[0].dictCode,
                })(
                  <Select allowClear>
                    {orderOptions}
                  </Select>
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
          scroll={{x: 2500}}
          columns={this.columns}
          rowSelection={rowSelection}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={record => `${record.orderNo} ${record.orderSeqNo}`}
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
