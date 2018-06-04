import React from 'react'
import { Table, Form, Row, Col, Input, Button, Modal, Popconfirm, notification, Select } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import ModalFrom from './form'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const Fields = {
  formularNo: {
    name: 'formularNo',
    userProps: { label: '公式代码', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  },
  formularType: {
    name: 'formularType',
    userProps: { label: '公式类型', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  },
};

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marketNo: '',
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const sysDictOptions = this.props.sysDicts.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>)

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem {...Fields.formularType.userProps}>
              {getFieldDecorator(Fields.formularType.name, { ...Fields.formularType.userRules, initialValue: this.props.sysDicts[0].dictCode })(
                <Select allowClear>
                  {sysDictOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.formularNo.userProps}>
              {getFieldDecorator(Fields.formularNo.name, { ...Fields.formularNo.userRules })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset="1">
            <Button type="primary" htmlType="submit">查询</Button>
            &emsp;<Button type="primary" onClick={this.props.setModal}>新增</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
const WrappedModalFrom = Form.create()(ModalFrom);

class FormularPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pageSize: 10,
      dataDetail: {},
      currentPage: 1,
      visible: false,
      readOnly: false,
      sysDicts: [{ dictCode: 'dd', dictName: 'dd' }],
    };

    this.columns = [
      {
        title: '公式代码',
        dataIndex: 'formularNo',
      },
      {
        title: '描述',
        dataIndex: 'formularName',
      },
      {
        title: '公式',
        dataIndex: 'formularValue',
      },
      {
        title: '单价',
        dataIndex: 'formularPrice',
      },
      {
        title: '备注',
        dataIndex: 'memo',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.setModal(record, false, true)}>查看</a> |
          <a onClick={() => this.setModal(record, true, false)}> 修改</a> |
          <Popconfirm
            okText="删除"
            cancelText="取消"
            title="确定删除吗?"
            overlayStyle={{ width: '200px' }}
            onConfirm={() => this.deleteRecord(record.formularNo)}
          >
            <a> 删除</a>
          </Popconfirm>
        </div>),
      },
    ];
  }

  componentWillMount() {
    request({
      url: `${config.APIV0}/api/sysDict/FORMULAR_TYPE`,
      method: 'get',
    }).then(data => this.setState({ sysDicts: data.data }));
    this.getList({});
  }

  setModal(data, modify, readOnly) {
    this.setState({
      visible: true,
      dataDetail: data,
      readOnly,
      modify,
    })
  }

  getList(param) {
    const query = {};
    Object.assign(query, { currPage: this.state.currentPage, pageSize: this.state.pageSize });
    if (typeof param !== 'number') {
      query.filter = param;
      this.condition = query;
    } else {
      this.condition.currPage = param;
    }
    request({ url: `${config.APIV0}/api/formular`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list,
        total: data.data.total,
        currentPage: data.data.currPage,
      }))
  }

  deleteRecord(id) {
    request({ url: `${config.APIV0}/api/formular/${id}`, method: 'delete' })
      .then((data) => {
        this.getList({});
        notification.success({ message: '操作成功', description: data.data });
      })
      .catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  addRecord(data) {
    request({ url: `${config.APIV0}/api/formular`, method: this.state.modify ? 'PUT' : 'POST', data })
      .then(() => {
        this.setState({ visible: false });
        this.getList({})
      }).catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  render () {
    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm sysDicts={this.state.sysDicts} search={this.getList.bind(this)} setModal={() => this.setModal({}, false, false)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          columns={this.columns}
          dataSource={this.state.data}
          rowKey={(record, key) => key}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          footer={null}
          title="编辑公式"
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
        >
          <WrappedModalFrom sysDicts={this.state.sysDicts} dataDetail={this.state.dataDetail} readOnly={this.state.readOnly} submit={value => !this.state.readOnly && this.addRecord(value)} />
        </Modal>
      </div>
    )
  }
}

FormularPage.propTypes = {
  dispatch: PropTypes.func,
}
export default FormularPage
