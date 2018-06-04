import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, Popconfirm, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import ModalFrom from './form'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const Fields = {
  roleCode: {
    name: 'roleCode',
    userProps: { label: '角色代码', labelCol: { span: 7 }, wrapperCol: { span: 16 } },
  },
  roleName: {
    name: 'roleName',
    userProps: { label: 'roleName', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  },
};

class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      material: '',
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

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem {...Fields.roleCode.userProps}>
              {getFieldDecorator(Fields.roleCode.name, { ...Fields.roleCode.userRules})(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.roleName.userProps}>
              {getFieldDecorator(Fields.roleName.name, { ...Fields.roleName.userRules })(
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

class RoleInfoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      visible: false,
      readOnly: false,
      roleInfos: [{ roleCode: 'dd', roleName: 'dd' }],
    };

    this.columns = [
      {
        title: '角色代码',
        dataIndex: 'roleCode',
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
      },    
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.setModal(record, false, true)}>查看</a> |
          <a onClick={() => this.setModal(record, true, false)}> 修改</a> |
          <Popconfirm
            title="确定删除吗?"
            overlayStyle={{ width: '200px' }}
            onConfirm={() => this.deleteRecord(record.roleCode)}
            okText="删除"
            cancelText="取消"
          >
            <a> 删除</a>
          </Popconfirm>
        </div>),
      },
    ];
  }


  componentDidMount() {
    this.getList({});
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
    request({ url: `${config.APIV0}/api/sysRole`, method: 'GET', data: this.condition })
      .then(data => this.setState({
        data: data.data.list,
        total: data.data.total,
        currentPage: data.data.currPage,
      }))
  }

  setModal(data, modify, readOnly) {
    this.setState({
      visible: true,
      dataDetail: data,
      readOnly,
      modify,
    })
  }

  deleteRecord(id) {
    request({ url: `${config.APIV0}/api/sysRole/${id}`, method: 'DELETE' })
      .then(() => this.getList({}))
      .catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  addRecord(data) {
    request({
      url: `${config.APIV0}/api/sysRole`,
      method: this.state.modify ? 'PUT' : 'POST',
      data
    }).then(() => {
      this.setState({
        visible: false,
        dataDetail: {roleCode:undefined,roleName: undefined}
      });
      this.getList({});
    }).catch(err => {
      notification.error({
        message: '操作失败',
        description: err.message,
      })
    })
  }

  render () {
    return (
      <div className="content-inner">
        <WrappedAdvancedSearchForm roleInfos={this.state.roleInfos} search={this.getList.bind(this)} setModal={() => this.setModal({}, false, false)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          columns={this.columns}
          dataSource={this.state.data}
          rowKey={(record, key) => key}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total }}
        />
        <Modal
          visible={this.state.visible}
          title="修改角色信息"
          footer={null}
          onCancel={() => this.setState({ visible: false })}
        >
          <WrappedModalFrom dataDetail={this.state.dataDetail} roleInfos={this.state.roleInfos} readOnly={this.state.readOnly} submit={value => !this.state.readOnly && this.addRecord(value)} />
        </Modal>
      </div>
    )
  }
}

RoleInfoPage.propTypes = {
  dispatch: PropTypes.func,
}
export default RoleInfoPage
