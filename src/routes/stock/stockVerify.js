import { Table, Form, Row, Col, Input, Button, Popconfirm, notification, Select } from 'antd'
import { EditableCell } from 'components'
import { request, config } from 'utils'
import PropTypes from 'prop-types'
import React from 'react'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companys: [{compName: '请输入', compNo: ''}],
      curCompany: {},
    };
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

  searchComp = (value) => {
    request({
      url: `${config.APIV0}/api/comp/findCompLike/${value}`,
      method: 'get',
    }).then(data => this.setState({ companys: data.data || [] }));
  }

  selectComp = (value) => {
    const {companys} = this.state;
    const compNo = value.split(/\s/)[0];
    // onSelect事件触发在formItem reset之前，需要在提交时重新指定compName
    this.props.form.setFieldsValue({supplyCompNo: compNo});
    this.setState({curCompany: companys[companys.findIndex(comp => comp.compNo === compNo)] || {}});
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        notification.error({
          message: '提交失败',
          description: '请检查表单',
        });
        return;
      }
      // Should format date value before submit.
      const values = {
        ...fieldsValue,
        supplyCompName: fieldsValue.supplyCompName.split(/\s/)[1],
        expectDate: fieldsValue.expectDate && fieldsValue.expectDate.format('YYYY-MM-DD'),
      };
      this.props.handleSubmit(values);
    });
  }

  render() {
    const {form: {getFieldDecorator}} = this.props;

    return (
      <Form
        layout="horizontal"
      >
        <Row>
          <Col span={6}>
            <FormItem label="单据编号" {...formItemRow}>
              {getFieldDecorator('reqNo')(
                <Input onPressEnter={e => this.props.addNewOrder(e.target.value.trim())} />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

class StockVerifyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dataDetail: {},
      data: [],
      currIndex: '0',
      supplyCompNo: '',
      selectedRowKeys: [],
      currentPage: 1,
      pageSize: 10,
    };
    this.cacheData = this.state.data.map(item => ({ ...item }));

    this.columns = [
      {
        title: '入库单号',
        dataIndex: 'stkInNo',
      },
      {
        title: '供货商',
        dataIndex: 'supplyCompName',
        render: (text, record, index) => (<EditableCell
          type="autoComplete"
          width={180}
          value={text}
          column="supplyCompName"
          source="Comp"
          editable={record.editable}
          onSelect={value => this.handleChangeSupplyCompName(value, index)}
          onChange={value => this.handleChange(value, record.key, 'supplyCompName')}
        />),
      },
      {
        title: '物料编码',
        dataIndex: 'materialNo',
        render: (text, record, index) => (<EditableCell
          type="autoComplete"
          width={180}
          value={text}
          column="materialNo"
          source="Material"
          editable={record.editable}
          onSelect={value => this.handleChangeMaterialNo(value, index)}
          onChange={value => this.handleChange(value, record.key, 'materialNo')}
        />),
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
        width: 110,
        title: '来料数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        width: 110,
        title: '合格数量',
        dataIndex: 'standNum',
        render: (text, record) => this.renderColumns(text, record, 'standNum'),
      },
      {
        title: '含潮率',
        dataIndex: 'moisRate',
        render: (text, record) => this.renderColumns(text, record, 'moisRate'),
      },
      {
        title: '重量',
        dataIndex: 'weight',
        render: (text, record) => this.renderColumns(text, record, 'weight'),
      },
      {
        title: '品质',
        dataIndex: 'quality',
        render: (text, record) => this.renderColumns(text, record, 'quality'),
      },
      {
        title: '不合格后续动作',
        dataIndex: 'nextAction',
        render: (text, record) => (<Select
          allowClear
          style={{width: 100}}
          onChange={value => console.warn(value, record)}
        >
          <Option value="1">退货</Option>
          <Option value="2">补给</Option>
          <Option value="3">返修</Option>
        </Select>),
      },
      {
        title: '不合格原因',
        dataIndex: 'reason',
        render: (text, record) => this.renderColumns(text, record, 'reason'),
      },
      {
        title: '备注',
        dataIndex: 'memo',
        render: (text, record) => this.renderColumns(text, record, 'memo'),
      },
      {
        title: '操作',
        fixed: 'right',
        width: 110,
        dataIndex: 'action',
        render: (data, record, index) => {
          const { editable } = record;
          return (<div>
            {editable ? <a onClick={() => this.save(record.key)}>确定</a> : <a onClick={() => this.edit(record.key)}>编辑</a>}
            &nbsp;|&nbsp;
            <Popconfirm
              okText="删除"
              cancelText="取消"
              title="确定删除吗?"
              overlayStyle={{ width: '200px' }}
              onConfirm={() => this.deleteRecord(index)}
            >
              <a>删除</a>
            </Popconfirm>
          </div>)
        },
      },
    ];
  }

  componentWillMount() {
    this.getList();
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows.map(item => item.orderNo));
    this.setState({ selectedRowKeys });
  }

  getList(param = {}) {
    const query = {};
    Object.assign(query, { currPage: this.state.currentPage, pageSize: this.state.pageSize });
    if (typeof param !== 'number') {
      Object.assign(param, {status: 'WAIT_VERIFY'})
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/stockVerify`, method: 'GET', data: this.condition })
      .then((data) => {
        data.data.list.forEach((record) => {
          record.editable = true;
          record.key = record.stkInNo;
        });
        this.setState({
          data: data.data.list || [],
          total: data.data.total,
          currentPage: data.data.currPage,
        })
      });
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
        url: `${config.APIV0}/api/stockVerify`,
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
          description: err.message,
        });
      });
    }
  }

  handleChange(value, key, column) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.key)[0];
    // 匹配供货商时需拆分供货商信息
    if (target) {
      if (column === 'supplyCompName' && target.supplyCompNo) {
        return false;
      }
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

  handleChangeProdNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      prodWidth: value.materialWidth,
      prodName: value.materialName,
      prodLong: value.materialLong,
      prodNo: value.materialNo,
      prodForm: value.prodForm,
      prodPrice: value.prodPrice,
      prodType: value.prodType,
      prodUnit: value.prodUnit,
    });
    this.setState({data});
  }

  handleChangeMaterialNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      materialName: value.materialName,
      spec: value.spec,
      pattern: value.pattern,
      price: value.price,
      unit: value.unit,
    });
    this.setState({data});
  }
  handleChangeSupplyCompName = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      supplyCompName: value.compName,
      supplyCompNo: value.compNo,
    });
    this.setState({data});
  }

  handleChangeFormularlNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      materialPriceExpress: value.formularValue,
      materialPriceName: value.formularName,
    });
    this.setState({data});
  }

  handleChangeTechNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      techName: value.formularName,
      techPrice: value.formularPrice,
      techPriceExpress: value.formularValue,
    });
    this.setState({data});
  }

  handleChangeFormularNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {formularType: value.formularNo, prodFormular: value.formularName})
    this.setState({data});
  }

  deleteRecord = (index) => {
    const {data} = this.state;
    data.splice(index, 1);
    this.setState({data});
  }

  handleSubmit = (formValue) => {
    request({
      url: `${config.APIV0}/api/purchase`,
      method: 'POST',
      data: {
        swPurOrderBaseVo: formValue,
        swPurOrderDetailVo: this.state.data,
      },
    }).then((res) => {
      notification.success({
        message: '操作成功',
        description: res.data,
      })
      this.setState({data: []});
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      })
    });
  }

  addNewOrder = (reqNo) => {
    const {data} = this.state;
    request({
      url: `${config.APIV0}/api/stockVerify/${reqNo}`,
      method: 'POST',
    }).then((res) => {
      res.data.forEach((record) => {
        record.editable = true;
        record.key = record.stkInNo;
      });
      this.setState({
        data: res.data.concat(data),
      });
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      })
    });
  }

  selectOrders = (selectedRows) => {
    const {data} = this.state;
    selectedRows.forEach((row, index) => {
      row.key = data.length ? (+data[data.length - 1].key + index + 1).toString() : `${index + 1}`;
    });
    this.setState({
      visible: false,
      data: data.concat(selectedRows),
    });
  }

  auditOrders(action, status) {
    const {data, selectedRowKeys} = this.state;
    request({
      url: `${config.APIV0}/api/stockVerify/check`,
      method: 'POST',
      data: {
        auditUserNo: '',
        auditUserName: '',
        auditAction: action,
        auditDesc: this.state.rejectReason,
        orderNos: selectedRowKeys,
        stockStatus: status,
      },
    }).then((res) => {
      notification.success({
        message: '操作成功',
        description: res.message,
      });
      selectedRowKeys.map((stkInNo) => {
        const index = data.findIndex(item => item.stkInNo === stkInNo);
        return data.splice(index, 1);
      })
      this.setState({
        selectedRowKeys: [],
        data,
      });
      // Todo
      // 移除已校验记录
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      });
    });
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
    const {selectedRowKeys} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm
          handleSubmit={this.handleSubmit}
          addNewOrder={this.addNewOrder}
          openSearch={() => this.setState({visible: true})}
        />
        <Button type="primary" onClick={() => this.auditOrders('AUDIT_PASS', 'WAIT_VERIFY')} disabled={selectedRowKeys.length === 0}>校验完成入库</Button>
        <Table
          bordered
          scroll={{x: 2300}}
          columns={this.columns}
          rowSelection={rowSelection}
          dataSource={this.state.data}
          style={{ margin: '16px 0' }}
          rowKey={record => record.stkInNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
      </div>
    )
  }
}

StockVerifyPage.propTypes = {
  dispatch: PropTypes.func,
}
export default StockVerifyPage
