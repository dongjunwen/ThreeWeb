import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, notification, message, DatePicker, Popconfirm } from 'antd';
import { EditableCell } from 'components';
import { request, config } from 'utils';
import PropTypes from 'prop-types';
import lodash from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const formItemRow = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepDicts: [{dictCode: 'code', dictDesc: ''}],
    };
  }

  componentWillMount() {
    Promise.all([
      request({url: `${config.APIV0}/api/sysDict/STEP_NO`}),
    ]).then((res) => {
      this.setState({
        stepDicts: res[0].data,
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
        values.startTime = values.startTime ? values.startTime.format('YYYY-MM-DD') : undefined;
        values.endTime = values.endTime ? values.endTime.format('YYYY-MM-DD') : undefined;
        this.props.search(values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const stepOptions = this.state.stepDicts.map(step => <Option key={step.dictCode}>{step.dictName}</Option>);

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem label="日期" {...formItemRow}>
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
          <Col span={2} offset="1">
            <Button type="primary" htmlType="submit">查询</Button>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="订单号" {...formItemRow}>
              {getFieldDecorator('orderNo')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="姓名" {...formItemRow}>
              {getFieldDecorator('userName')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="步骤" {...formItemRow}>
              {getFieldDecorator('stepNo', {
                initialValue: this.state.stepDicts[0] && this.state.stepDicts[0].dictCode,
              })(
                <Select allowClear>
                  {stepOptions}
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

class WorkModiPage extends React.Component {
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
        title: '日期',
        dataIndex: 'workDate',
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
        title: '工号',
        dataIndex: 'userNo',
      },
      {
        title: '姓名',
        dataIndex: 'userName',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        title: '数量',
        dataIndex: 'num',
        render: (text, record) => this.renderColumns(text, record, 'num'),
      },
      {
        title: '步骤流程',
        dataIndex: 'stepName',
      },
      {
        title: '工艺',
        dataIndex: 'processName',
      },
      {
        title: '操作人',
        dataIndex: 'modiName',
      },
      {
        title: '操作时间',
        dataIndex: 'modiTime',
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
      query.startTime = param.startTime;
      query.endTime = param.endTime;
      delete param.startTime;
      delete param.endTime;
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/work`, method: 'GET', data: this.condition })
      .then((data) => {
        data.data.list.forEach((record) => {
          record.key = record.workNo;
          record.editable = true;
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

  deleteRecord = (workNos) => {
    console.log("workNOs:",workNos);
    const {data} = this.state;
    request({
      url: `${config.APIV0}/api/work/${workNos}`,
      method: 'DELETE',
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
        <WrappedAdvancedSearchForm search={this.getList.bind(this)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <div className="divided-button">
          <Button type="primary" onClick={() => this.deleteRecord(selectedRowKeys)} disabled={selectedRowKeys.length === 0}>删除</Button>
        </div>
        <Table
          bordered
          columns={this.columns}
          style={{marginTop: '16px'}}
          rowSelection={rowSelection}
          dataSource={this.state.data}
          rowKey={record => record.workNo}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
      </div>
    )
  }
}

WorkModiPage.propTypes = {
  dispatch: PropTypes.func,
}
export default WorkModiPage
