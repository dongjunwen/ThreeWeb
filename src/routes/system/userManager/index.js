import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, Popconfirm, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import ModalFrom from './form'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const Fields = {
  userNo: {
    name: 'userNo',
    userProps: { label: '账号', labelCol: { span: 7 }, wrapperCol: { span: 16 } },
  },
  userName: {
    name: 'userName',
    userProps: { label: '姓名', labelCol: { span: 7 }, wrapperCol: { span: 16 } },
  },
  phoneNum: {
    name: 'phoneNum',
    userProps: { label: '手机号', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  },
  emailAddr: {
    name: 'emailAddr',
    userProps: { label: '邮箱', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  },
};

class UserSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userManger: '',
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
          <FormItem {...Fields.userNo.userProps}>
              {getFieldDecorator(Fields.userNo.name)(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.userName.userProps}>
              {getFieldDecorator(Fields.userName.name)(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.phoneNum.userProps}>
              {getFieldDecorator(Fields.phoneNum.name)(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.emailAddr.userProps}>
              {getFieldDecorator(Fields.emailAddr.name)(
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
const WrappedAdvancedSearchForm = Form.create()(UserSearchForm);
const WrappedModalFrom = Form.create()(ModalFrom);

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      visible: false,
      readOnly: false
    };

    this.columns = [
      {
        title: '账号',
        dataIndex: 'userNo',
      },
      {
        title: '姓名',
        dataIndex: 'userName',
      },
      {
        title: '昵称',
        dataIndex: 'nickName',
      },
      {
        title: '手机号',
        dataIndex: 'phoneNum',
      },
      {
        title: '邮箱地址',
        dataIndex: 'emailAddr',
      },
      {
        title: '状态',
        dataIndex: 'statusName',
      },
      {
        title: '所属角色',
        dataIndex: 'roleCode',
      },
      {
        title: '所属部门',
        dataIndex: 'departNo',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (data, record) => (<div>
          <a onClick={() => this.setModal(record, false, true)}>查看</a> |
          <a onClick={() => this.setModal(record, true, false)}>修改</a> |                  
          <a onClick={() => this.updateRecord(record.userNo)}>{record.status=='Y'?'禁用':'启用'}</a>|
          <Popconfirm
            okText="删除"
            cancelText="取消"
            title="确定删除吗?"
            overlayStyle={{ width: '200px' }}
            onConfirm={() => this.deleteRecord(record.userNo)}
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
    request({ url: `${config.APIV0}/api/user`, method: 'GET', data: this.condition })
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
    request({ url: `${config.APIV0}/api/user/${id}`, method: 'DELETE' })
      .then(() => this.getList({}))
      .catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  
  updateRecord(id) {
    request({ url: `${config.APIV0}/api/user/${id}`, method: 'PUT' })
      .then(() => this.getList({}))
      .catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  addRecord(data) {
    request({
      url: this.state.modify ?`${config.APIV0}/api/user/updateUser`:`${config.APIV0}/api/user/`,
      method: this.state.modify ? 'PUT' : 'POST',
      data
    }).then(() => {
      this.setState({
        visible: false,
        dataDetail: {userNo:undefined,userName:undefined,phoneNum:undefined,emailAddr:undefined,nickName:undefined,memo:undefined}
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
        <WrappedAdvancedSearchForm  search={this.getList.bind(this)} setModal={() => this.setModal({}, false, false)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          columns={this.columns}
          dataSource={this.state.data}
          rowKey={(record, key) => key}
          pagination={
              { 
                pageSize: this.state.pageSize,
                onChange: this.getList.bind(this), 
                defaultCurrent: 1, 
                current: this.state.currentPage, 
                total: this.state.total
             } 
          }
        />
        <Modal
          visible={this.state.visible}
          title="修改用户信息"
          footer={null}
          onCancel={() => this.setState({ visible: false })}
        >
          <WrappedModalFrom dataDetail={this.state.dataDetail}  readOnly={this.state.readOnly} submit={value => !this.state.readOnly && this.addRecord(value)} />
        </Modal>
      </div>
    )
  }
}

UserPage.propTypes = {
  dispatch: PropTypes.func,
}
export default UserPage
