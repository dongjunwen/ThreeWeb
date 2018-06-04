import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, DatePicker, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusTypes: [{dictCode: 'code', dictDesc: ''}],
      materialStocks: [{dictCode: 'code', dictDesc: ''}],
      materials: [{dictCode: 'code', dictDesc: ''}],
    };
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/VERIFY_STATUS`}),
      request({url: `${config.APIV0}/api/sysDict/MATERIAL_TYPE`}),
      request({url: `${config.APIV0}/api/sysDict/MATERIAL_STOCK`}),
    ]).then((res) => {
      this.setState({
        statusTypes: res[0].data,
        materials: res[1].data,
        materialStocks: res[2].data,
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
    const stockOptions = this.state.materialStocks.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);
    const materialOptions = this.state.materials.map(material => <Option key={material.dictCode}>{material.dictName}</Option>)

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="入库日期" {...formItemRow}>
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
          <Col span={6} offset="1">
            <Button type="primary" htmlType="submit">查询</Button>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="仓库位置" {...formItemRow}>
              {getFieldDecorator('materialStock', {
                initialValue: this.state.materialStocks[0] && this.state.materialStocks[0].dictCode,
              })(
                <Select allowClear>
                  {stockOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="物料类型" {...formItemRow}>
              {getFieldDecorator('materialType', {
                initialValue: this.state.materials[0] && this.state.materials[0].dictCode,
              })(
                <Select allowClear>
                  {materialOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="校验状态" {...formItemRow}>
              {getFieldDecorator('status', {
                initialValue: this.state.statusTypes[0] && this.state.statusTypes[0].dictCode,
              })(
                <Select allowClear>
                  {statusOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

class StockListPage extends React.Component {
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
    };
    this.columns = [
      {
        title: '序号',
        render: (text, record, index) => index + 1 + (this.state.currentPage * 10) - 10,
      },
      {
        title: '物料编码',
        dataIndex: 'materialNo',
      },
      {
        title: '品名',
        dataIndex: 'materialName',
      },
      {
        title: '规格',
        dataIndex: 'pattern',
      },
      {
        title: '型号',
        dataIndex: 'spec',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        title: '合格数量',
        dataIndex: 'standNum',
      },
      {
        title: '仓库名称',
        dataIndex: 'materialStockName',
      },
      {
        title: '来料数量',
        dataIndex: 'num',
      },
      {
        title: '检验状态',
        dataIndex: 'statusName',
      },
      {
        title: '含潮率',
        dataIndex: 'moisRate',
      },
      {
        title: '重量',
        dataIndex: 'weight',
      },
      {
        title: '品质',
        dataIndex: 'quality',
      },
      {
        title: '备注',
        dataIndex: 'memo',
      },
      {
        title: '采购单号',
        dataIndex: 'sourceNo',
      },
      {
        title: '采购单序号',
        dataIndex: 'sourceSeqNo',
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
        title: '供货商',
        dataIndex: 'supplyCompName',
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
    request({ url: `${config.APIV0}/api/stockVerify`, method: 'GET', data: this.condition })
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

  render () {
    const {visible, orderDetail} = this.state;
    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          scroll={{x: 2000}}
          columns={this.columns}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey={record => record.purNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
      </div>
    )
  }
}

StockListPage.propTypes = {
  dispatch: PropTypes.func,
}
export default StockListPage
