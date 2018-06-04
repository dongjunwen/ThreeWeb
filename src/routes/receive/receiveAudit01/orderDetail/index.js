import { Table, Form, Row, Col, Input, Popconfirm, notification, DatePicker } from 'antd'
import { EditableCell } from 'components'
import { request, config } from 'utils'
import PropTypes from 'prop-types'
import React from 'react'
import moment from 'moment';

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
        applyDate: fieldsValue.applyDate && fieldsValue.applyDate.format('YYYY-MM-DD'),
        expectDate: fieldsValue.expectDate && fieldsValue.expectDate.format('YYYY-MM-DD'),
      };
      this.props.handleSubmit(values);
    });
  }

  render() {
    const {form: {getFieldDecorator}, swReceiveBaseResultVo} = this.props;

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={8}>
            <FormItem label="领料单号" {...formItemRow}>
              {getFieldDecorator('recvNo', {
                initialValue: swReceiveBaseResultVo.recvNo,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="领料日期" {...formItemRow}>
              {getFieldDecorator('recvDate', {
                rules: [{required: true, message: '请选择日期'}],
                initialValue: moment(swReceiveBaseResultVo.recvDate),
              })(
                <DatePicker style={{ width: '100%'}} format="YYYY-MM-DD" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="领料人" {...formItemRow}>
              {getFieldDecorator('recver', {
                initialValue: swReceiveBaseResultVo.recver,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="用途" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('useWay', {
                initialValue: swReceiveBaseResultVo.useWay,
              })(
                <Input.TextArea autosize={{ minRows: 3 }} placeholder="请输入用途" />
              )}
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <FormItem label="备注" {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}>
              {getFieldDecorator('memo', {
                initialValue: swReceiveBaseResultVo.memo,
              })(
                <Input.TextArea autosize={{ minRows: 3 }} placeholder="请输入备注" />
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
      data: this.props.orderDetail.swReceiveDetailResultVoList || [],
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
          editable
          width={180}
          value={text}
          source="Material"
          type="autoComplete"
          column="materialNo"
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
        width: 100,
        title: '数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        title: '备注',
        dataIndex: 'memo',
        render: (text, record) => this.renderColumns(text, record, 'memo'),
      },
    ];
    if (!this.props.readOnly) {
      this.columns.push({
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
      });
    }
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
        swPurOrderBaseModiVo: formValue,
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

  selectOrders = (selectedRows) => {
    const {data} = this.state;
    this.setState({
      visible: false,
      data: data.concat(selectedRows),
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
          search={this.getList.bind(this)}
          handleSubmit={this.handleSubmit}
          searchOrder={this.searchOrder}
          openSearch={supplyCompNo => this.setState({visible: true, supplyCompNo})}
          swReceiveBaseResultVo={this.props.orderDetail.swReceiveBaseResultVo}
        />
        <Table
          bordered
          columns={this.columns}
          pagination={false}
          scroll={{x: 1100}}
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
