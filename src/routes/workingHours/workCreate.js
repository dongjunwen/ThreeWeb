import { Table, Form, Row, Col, Input, Button, Popconfirm, notification, DatePicker, AutoComplete, message, Select, Upload } from 'antd'
import { EditableCell } from 'components'
import { request, config } from 'utils'
import PropTypes from 'prop-types'
import lodash from 'lodash';
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
            {false && <FormItem label="单据编号" {...formItemRow}>
              {getFieldDecorator('reqNo')(
                <Input onPressEnter={e => this.props.addNewOrder(e.target.value.trim())} />
              )}
            </FormItem>}
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

class WorkCreatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dataDetail: {},
      data: [],
      currIndex: '0',
      supplyCompNo: '',
      selectedRowKeys: [],
      stepDicts: [{dictCode: 'code', dictDesc: ''}],
      currentPage: 1,
      pageSize: 10,
    };
    this.cacheData = this.state.data.map(item => ({ ...item }));

    this.columns = [
      {
        title: '日期',
        dataIndex: 'workDate',
        render: (text, record) => this.renderColumns(text, record, 'workDate', 'datePicker'),
      },
      {
        title: '订单号',
        dataIndex: 'orderNo',
        render: (text, record) => this.renderColumns(text, record, 'orderNo'),
      },
      {
        title: '订单序号',
        dataIndex: 'orderSeqNo',
        render: (text, record) => this.renderColumns(text, record, 'orderSeqNo'),
      },
      {
        title: '工号',
        dataIndex: 'userNo',
        render: (text, record) => this.renderColumns(text, record, 'userNo'),
      },
      {
        title: '姓名',
        dataIndex: 'userName',
        render: (text, record) => this.renderColumns(text, record, 'userName'),
      },
      {
        title: '单位',
        dataIndex: 'unit',
        render: (text, record) => this.renderColumns(text, record, 'unit'),
      },
      {
        title: '数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        width: 80,
        title: '步骤流程',
        dataIndex: 'stepName',
        render: (text, record) => this.renderColumns(record.editable ? {key: record.stepNo || ''} : text, record, 'stepName', 'select', this.state.stepDicts.map(item => ({label: item.dictName, value: item.dictValue}))),
      },
      {
        title: '工艺',
        dataIndex: 'processName',
        render: (text, record) => this.renderColumns(text, record, 'processName'),
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
            &nbsp;|&nbsp;
            <Popconfirm
              okText="删除"
              cancelText="取消"
              title="确定删除吗?"
              overlayStyle={{ width: '200px' }}
              onConfirm={() => this.deleteRecord([record.workNo])}
            >
              <a>删除</a>
            </Popconfirm>
          </div>)
        },
      },
    ];
  }

  componentWillMount() {
    // this.getList();
    request({
      url: `${config.APIV0}/api/sysDict/STEP_NO`,
    }).then((res) => {
      this.setState({
        stepDicts: res.data,
      })
    });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows.map(item => item.orderNo));
    this.setState({ selectedRowKeys });
  }

  onFileChange = (info) => {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      if (info.file.response.success) {
        message.success(`${info.file.name} 导入成功`);
        info.file.response.data.forEach((item, index) => {
          item.editable = true;
          item.key = `${index}`;
        });
        this.setState({
          data: info.file.response.data,
        });
      } else {
        message.error(`${info.file.name} 导入失败，失败原因：${info.file.response.message}`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 导入失败`);
    }
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
        url: `${config.APIV0}/api/work`,
        method: 'POST',
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
      target[column] = value;
      // 计算价格
      switch (column) {
        case 'num':
          target.amt = (target.price || 0) * Number(value) || 0;
          break;
        case 'stepName':
          target.stepName = value.label;
          target.stepNo = value.key;
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

  deleteRecord = (workNos) => {
    const {data} = this.state;
    request({
      url: `${config.APIV0}/api/work/delByWorkNos`,
      method: 'POST',
      data: {workNos},
    }).then((res) => {
      notification.success({
        message: '操作成功',
        description: res.data,
      })
      lodash.remove(data, item => workNos.some(workNo => workNo === item.workNo));
      this.setState({
        selectedRowKeys: [],
        data,
      });
    }).catch((err) => {
      notification.error({
        message: '操作失败',
        description: err.message,
      })
    });
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

  renderColumns(text, record, column, type = 'input', sourceData) {
    return (
      <EditableCell
        type={type}
        value={text}
        column={column}
        sourceData={sourceData}
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
    const uploadProps = {
      name: 'uploadFile',
      withCredentials: true,
      showUploadList: false,
      action: `${config.APIV0}/api/work/import`,
    }

    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm
          handleSubmit={this.handleSubmit}
          addNewOrder={this.addNewOrder}
          openSearch={() => this.setState({visible: true})}
        />
        <div className="divided-button">
          <Button type="primary" onClick={() => this.deleteRecord(selectedRowKeys)} disabled={selectedRowKeys.length === 0}>删除</Button>
          <Button type="primary" onClick={() => window.open(`${config.APIV0}/api/work/downTemplate`)}>下载模板</Button>
          <Upload {...uploadProps} onChange={this.onFileChange}>
            <Button type="primary">导入</Button>
          </Upload>
          {false && <Button type="primary" onClick={this.addNewOrder}>新增</Button>}
        </div>
        <Table
          bordered
          pagination={false}
          scroll={{x: 1300}}
          columns={this.columns}
          rowSelection={rowSelection}
          dataSource={this.state.data}
          style={{ margin: '16px 0' }}
          rowKey={record => record.workNo}
        />
      </div>
    )
  }
}

WorkCreatePage.propTypes = {
  dispatch: PropTypes.func,
}
export default WorkCreatePage
