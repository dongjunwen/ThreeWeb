import { Table, Form, Row, Col, Input, Button, Select, Popconfirm, notification, DatePicker, AutoComplete, Checkbox, Radio } from 'antd'
import { EditableCell } from 'components'
import { request, config } from 'utils'
import PropTypes from 'prop-types'
import moment from 'moment'
import React from 'react'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

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
    this.setState({curCompany: companys[companys.findIndex(comp => comp.compNo === value.split(/\s/)[0])] || {}});
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
        deliverDate: fieldsValue.deliverDate && fieldsValue.deliverDate.format('YYYY-MM-DD'),
      };
      this.props.handleSubmit(values);
    });
  }

  render() {
    const {form: {getFieldDecorator}, swDeliverBaseResutVo, userInfo, readOnly} = this.props;
    const {curCompany, companys} = this.state;
    const orderOptions = this.props.deliverWays.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>);

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="发货单号" {...formItemRow}>
              {getFieldDecorator('deliverNo', {
                initialValue: swDeliverBaseResutVo.deliverNo,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="预发货日期" {...formItemRow}>
              {getFieldDecorator('deliverDate', {
                rules: [{required: true, message: '请选择日期'}],
                initialValue: moment(swDeliverBaseResutVo.deliverDate),
              })(
                <DatePicker style={{ width: '100%'}} format="YYYY-MM-DD" />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            {!true && <Button type="primary" onClick={this.handleSubmit}>保存</Button>}
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="货运方式" {...formItemRow}>
              {getFieldDecorator('deliverWay', {
                initialValue: swDeliverBaseResutVo.deliverWay && this.props.deliverWays[0].dictCode,
              })(
                <Select>
                  {orderOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="发货人" {...formItemRow}>
              {getFieldDecorator('sendName', {
                initialValue: swDeliverBaseResutVo.sendName,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="是否保价" {...formItemRow}>
              {getFieldDecorator('ifGurant', {
                valuePropName: 'checked',
                initialValue: swDeliverBaseResutVo.ifGurant || 'N',
              })(
                <RadioGroup defaultValue={swDeliverBaseResutVo.ifGurant || 'N'}>
                  <Radio value="Y">是</Radio>
                  <Radio value="N">否</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="客户" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('custCompName', {
                rules: [{required: true, message: '请选择或输入客户信息'}],
                initialValue: swDeliverBaseResutVo.custCompName,
              })(
                <AutoComplete dataSource={companys.map(comp => `${comp.compNo} ${comp.compName}`)} onSearch={this.searchComp} onSelect={this.selectComp} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="联系人" {...formItemRow}>
              {getFieldDecorator('custContactName', {
                initialValue: swDeliverBaseResutVo.custContactName || curCompany.contactName,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="手机" {...formItemRow}>
              {getFieldDecorator('custMobile', {
                initialValue: swDeliverBaseResutVo.custMobile || curCompany.mobile,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="电话" {...formItemRow}>
              {getFieldDecorator('custPhone', {
                initialValue: swDeliverBaseResutVo.custPhone || curCompany.telphone,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="传真" {...formItemRow}>
              {getFieldDecorator('custTax', {
                initialValue: swDeliverBaseResutVo.custTax || curCompany.tax,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="地址" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('custAddr', {
                initialValue: swDeliverBaseResutVo.custAddr || curCompany.addr,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="备注" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('memo', {
                initialValue: swDeliverBaseResutVo.memo,
              })(
                <Input />
              )}
            </FormItem>
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
      data: this.props.orderDetail.swDeliverDetailResutVos || [],
      userInfo: {
        swCompInfoResultVo: {},
      },
      deliverWays: [{dictCode: 'code', dictDesc: ''}],
      currIndex: '0',
    };
    this.cacheData = this.state.data.map(item => ({ ...item }));

    this.columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (text, record, index) => index + 1,
      },
      {
        title: '订单序号',
        dataIndex: 'orderSeqNo',
      },
      {
        title: '订单号',
        dataIndex: 'orderNo',
      },
      {
        title: '箱号',
        dataIndex: 'boxNo',
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
        title: '备注',
        dataIndex: 'memo',
      },
    ];
    if (!true) {
      this.columns.push({
        title: '操作',
        fixed: 'right',
        width: 60,
        dataIndex: 'action',
        render: (data, record, index) => <Popconfirm
          okText="删除"
          cancelText="取消"
          title="确定删除吗?"
          overlayStyle={{ width: '200px' }}
          onConfirm={() => this.deleteRecord(index)}
        >
          <a>删除</a>
        </Popconfirm>,
      });
    }
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/DELIVER_WAY`}),
      request({url: `${config.APIV0}/api/getCurrentUser`}),
    ]).then((res) => {
      this.setState({
        deliverWays: res[0].data,
        userInfo: res[1].data,
      });
    });
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
        case 'prodNum':
          target.prodAmt = (target.prodPrice || 0) * Number(value) || 0;
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
      prodForm: value.pattern,
      prodPrice: value.price,
      prodType: value.spec,
      prodUnit: value.unit,
    });
    this.setState({data});
  }

  handleChangeMaterialNo = (value, index) => {
    const {data} = this.state;
    data[index] = Object.assign(data[index], {
      materialName: value.materialName,
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
      url: `${config.APIV0}/api/deliver`,
      method: formValue.deliverNo ? 'PUT' : 'POST',
      data: {
        swDeliverBaseVo: formValue,
        swDeliverDetailVoList: this.state.data,
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
    const {readOnly} = this.props;

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm
          readOnly={readOnly}
          userInfo={this.state.userInfo}
          search={this.getList.bind(this)}
          deliverWays={this.state.deliverWays}
          handleSubmit={this.handleSubmit}
          swDeliverBaseResutVo={this.props.orderDetail.swDeliverBaseResutVo}
        />
        <Table
          bordered
          columns={this.columns}
          pagination={false}
          scroll={{x: 1500}}
          dataSource={this.state.data}
          style={{ margin: '16px 0' }}
          rowKey={(record, key) => key}
        />
      </div>
    )
  }
}

CreateOrderPage.propTypes = {
  dispatch: PropTypes.func,
}
export default CreateOrderPage
