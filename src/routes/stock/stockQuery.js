import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, notification, Upload, message } from 'antd';
import { EditableCell } from 'components';
import { request, config } from 'utils';
import PropTypes from 'prop-types';

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      materialStocks: [{dictCode: 'code', dictDesc: ''}],
      materials: [{dictCode: 'code', dictDesc: ''}],
    };
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/MATERIAL_TYPE`}),
      request({url: `${config.APIV0}/api/sysDict/MATERIAL_STOCK`}),
    ]).then((res) => {
      this.setState({
        materials: res[0].data,
        materialStocks: res[1].data,
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

  onFileChange = (info) => {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      if (info.file.response.success) {
        message.success(`${info.file.name} 导入成功`);
      } else {
        message.error(`${info.file.name} 导入失败，失败原因：${info.file.response.message}`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 导入失败`);
    }
  }

  handleSearch(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        // dddd
      } else {
        // 验证通过
        this.props.search(values);
      }
    });
  }

  exportExcel = () => {
    const params = this.props.form.getFieldsValue();
    let query = '';
    const a = document.createElement('a');
    a.download = true;
    a.target = '_blank';
    for (let item in params) {
      if (params[item] === undefined) {
        params[item] = '';
      }
      query += `${item}=${encodeURI(params[item])}&`;
    }
    a.href = `${config.APIV0}/api/stockInfo/exportExcel?${query}`;
    a.click();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const stockOptions = this.state.materialStocks.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);
    const materialOptions = this.state.materials.map(material => <Option key={material.dictCode}>{material.dictName}</Option>);
    const uploadProps = {
      name: 'uploadFile',
      withCredentials: true,
      showUploadList: false,
      action: `${config.APIV0}/api/stockInfo/import`,
    }

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="仓库名称" {...formItemRow}>
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
            <FormItem label="所属类型 " {...formItemRow}>
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
            <FormItem label="物料编码" {...formItemRow}>
              {getFieldDecorator('materialNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={5} offset="1">
            <Button type="primary" htmlType="submit">查询</Button>
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <Button type="primary" onClick={() => window.open(`${config.APIV0}/api/stockInfo/downTemplate`)}>模板下载</Button>
          </Col>
          <Col span={3}>
            <Upload {...uploadProps} onChange={this.onFileChange}>
              <Button type="primary">导入</Button>
            </Upload>
          </Col>
          <Col span={3}>
            <Button type="primary" onClick={this.exportExcel}>导出Excel</Button>
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
        title: '仓库名称',
        dataIndex: 'materialStockName',
      },
      {
        title: '物料编码',
        dataIndex: 'materialNo',
      },
      {
        title: '物料名称',
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
        title: '物料类型',
        dataIndex: 'materialType',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        width: 110,
        title: '数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        title: '操作',
        fixed: 'right',
        width: 110,
        dataIndex: 'action',
        render: (data, record) => {
          const { editable } = record;
          return (<div>
            {editable ? <a onClick={() => this.save(record.key)}>保存</a> : <a onClick={() => this.edit(record.key)}>编辑</a>}
          </div>)
        },
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
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/stockInfo`, method: 'GET', data: this.condition })
      .then((data) => {
        data.data.list.forEach((record, index) => {
          record.editable = false;
          record.key = `${(data.data.currPage * 10) + index}`;
        });
        this.setState({
          data: data.data.list || [],
          total: data.data.total,
          currentPage: data.data.currPage,
        });
      });
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

  edit(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData });
    }
  }

  save(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      request({
        url: `${config.APIV0}/api/stockInfo`,
        method: 'PUT',
        data: target,
      }).then((res) => {
        notification.success({
          message: '操作成功',
          description: res.message,
        });
        delete target.editable;
        this.setState({ data: newData });
        this.cacheData = newData.map(item => ({ ...item }));
      }).catch((err) => {
        notification.error({
          message: '操作失败',
          description: err.data,
        });
      });
    }
  }

  handleChange(value, key, column) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      // 计算价格
      switch (column) {
        case 'num':
          target.amt = (target.price || 0) * Number(value) || 0;
          break;
        default:
          break;
      }
      this.setState({ data: newData });
    }
  }

  renderColumns(text, record, column, type = 'input') {
    return (
      <EditableCell
        type={type}
        value={text}
        column={column}
        editable={record.editable}
        onChange={value => this.handleChange(value, record.key, column)}
      />
    );
  }
  render () {
    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          dataSource={this.state.data}
          rowKey="key"
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
