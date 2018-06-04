import { Table, Form, Row, Col, Input, Button, Popconfirm, notification, DatePicker, AutoComplete, Modal } from 'antd'
import { EditableCell } from 'components'
import { request, config } from 'utils'
import PropTypes from 'prop-types'
import React from 'react'
import OrderListPage from './form'

const FormItem = Form.Item;

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
    getFieldDecorator('supplyCompNo');
    const {curCompany, companys} = this.state;

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="要求到货日期" {...formItemRow}>
              {getFieldDecorator('expectDate', {
                rules: [{required: true, message: '请选择日期'}],
              })(
                <DatePicker style={{ width: '100%'}} format="YYYY-MM-DD" />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <Button type="primary" onClick={this.handleSubmit}>保存</Button>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="业务负责人" {...formItemRow}>
              {getFieldDecorator('respName')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="供货商" {...formItemRow}>
              {getFieldDecorator('supplyCompName', {
                rules: [{required: true, message: '请选择或输入供货商信息'}],
              })(
                <AutoComplete dataSource={companys.map(comp => `${comp.compNo} ${comp.compName}`)} onSearch={this.searchComp} onSelect={this.selectComp} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="供货商联系人" {...formItemRow}>
              {getFieldDecorator('supplyContactName', {
                initialValue: curCompany.contactName,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="供货商手机" {...formItemRow}>
              {getFieldDecorator('supplyMobile', {
                initialValue: curCompany.mobile,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="供货商电话" {...formItemRow}>
              {getFieldDecorator('supplyPhone', {
                initialValue: curCompany.telphone,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="供货商传真" {...formItemRow}>
              {getFieldDecorator('supplyTax', {
                initialValue: curCompany.tax,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="供货商地址" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('supplyAddr', {
                initialValue: curCompany.addr,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="备注" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('memo')(
                <Input.TextArea autosize={{ minRows: 3 }} placeholder="请输入备注" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={7}>
            <Button type="primary" onClick={this.props.addNewOrder}>新增</Button>&emsp;或&emsp;
            <Button
              type="primary"
              onClick={() => this.props.openSearch()}
            >搜索订单号</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

class CreateOrderPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dataDetail: {},
      data: [],
      currIndex: '0',
      supplyCompNo: '',
    };
    this.cacheData = this.state.data.map(item => ({ ...item }));

    this.columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (text, record, index) => index + 1,
      },
      {
        title: '物料编码',
        dataIndex: 'materialNo',
        render: (text, record, index) => (<EditableCell
          width={180}
          type="autoComplete"
          value={text}
          column="materialNo"
          source="Material"
          editable
          onSelect={value => this.handleChangeMaterialNo(value, index)}
          onChange={value => this.handleChange(value, record.key, 'materialNo')}
        />),
      },
      {
        title: '品名',
        dataIndex: 'prodName',
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
        title: '有效幅宽',
        dataIndex: 'materialWidth',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        title: '单价',
        dataIndex: 'price',
      },
      {
        width: 100,
        title: '数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        title: '金额',
        dataIndex: 'amt',
        render: text => Math.floor(text * 100) / 100,
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
        title: '备注',
        dataIndex: 'memo',
        render: (text, record) => this.renderColumns(text, record, 'memo'),
      },
      {
        title: '操作',
        fixed: 'right',
        width: 60,
        dataIndex: 'action',
        render: (data, record, index) => (<Popconfirm
          okText="删除"
          cancelText="取消"
          title="确定删除吗?"
          overlayStyle={{ width: '200px' }}
          onConfirm={() => this.deleteRecord(index)}
        >
          <a>删除</a>
        </Popconfirm>),
      },
    ];
  }

  getList(param) {
    Object.assign(param, { pageSize: 10, currPage: 1 });
    request({ url: `${config.APIV0}/api/formular`, method: 'GET', data: param }).then(data => this.setState({ data: data.data.list }))
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
      delete target.editable;
      this.setState({ data: newData });
      this.cacheData = newData.map(item => ({ ...item }));
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
      materialWidth: value.materialWidth,
      materialLong: value.materialLong,
      materialType: value.materialType,
      materialName: value.materialName,
      spec: value.materialSpec,
      pattern: value.materialPattern,
      price: value.materialPrice,
      unit: value.materialUnit,
      num: value.materialNum,
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

  searchOrder = (orderNo = '') => {
    request({
      url: `${config.APIV0}/api/order/${orderNo.trim()}`,
      method: 'get',
    }).then((res) => {
      const {data} = this.state;
      this.setState({ data: data.concat(res.data.swORderDetailResultVos || []) });
    }).catch(err => notification.error({message: '查询失败', description: err.message}));
  }

  addNewOrder = () => {
    const {data} = this.state;
    data.push({key: data.length ? (+data[data.length - 1].key + 1).toString() : '0'});
    this.setState({data});
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

  renderColumns(text, record, column, type = 'input') {
    return (
      <EditableCell
        editable
        type={type}
        value={text}
        column={column}
        onChange={value => this.handleChange(value, record.key, column)}
      />
    );
  }

  render () {
    const {supplyCompNo} = this.state;

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm
          search={this.getList.bind(this)}
          handleSubmit={this.handleSubmit}
          searchOrder={this.searchOrder}
          addNewOrder={this.addNewOrder}
          openSearch={() => this.setState({visible: true})}
        />
        <Table
          bordered
          pagination={false}
          scroll={{x: 1100}}
          columns={this.columns}
          dataSource={this.state.data}
          style={{ margin: '16px 0' }}
          rowKey={(record, key) => key}
        />
        <Modal
          width="1000px"
          title="选择订单号"
          visible={this.state.visible}
          onCancel={() => this.setState({visible: false})}
          footer={null}
        >
          <OrderListPage supplyCompNo={supplyCompNo} selectOrders={this.selectOrders} />
        </Modal>
      </div>
    )
  }
}

CreateOrderPage.propTypes = {
  dispatch: PropTypes.func,
}
export default CreateOrderPage
