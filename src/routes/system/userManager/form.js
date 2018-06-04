import React from 'react'
import { Form, Row, Col, Input, Button, notification, Select } from 'antd'
import { request } from 'utils'

const FormItem = Form.Item;
//const Option = Select.Option;

const Fields = {
  userNo: {
    name: 'userNo',
    userProps: { label: '账号', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  userName: {
    name: 'userName',
    userProps: { label: '姓名', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  nickName: {
    name: 'nickName',
    userProps: { label: '昵称', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  phoneNum: {
    name: 'phoneNum',
    userProps: { label: '手机号', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  emailAddr: {
    name: 'emailAddr',
    userProps: { label: '邮箱地址', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  memo: {
    name: 'memo',
    userProps: { label: '备注', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  roleCode: {
    name: 'roleCode',
    userProps: { label: '角色代码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  departNo: {
    name: 'departNo',
    userProps: { label: '部门编号', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
};
export default class UserSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marketNo: '',
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        // dddd
      } else {
        // 验证通过
        this.props.submit(values);
      }
    });
  }

  render() {
    const { form: { getFieldDecorator }, dataDetail, readOnly } = this.props;

    return (
      <Form
        onSubmit={this.handleSubmit.bind(this)}
      >
        <Row>
          <Col span={12}> <label>新用户初始密码为:123456</label></Col>
          <Col span={12}> 
                <FormItem {...{
                wrapperCol: {
                  xs: {
                    span: 24,
                    offset: 0,
                  },
                  sm: {
                    span: 14,
                    offset: 6,
                  },
                },
              }}
              >
                {!readOnly && <Button type="primary" htmlType="submit">保存</Button>}
              </FormItem>
          </Col>
        </Row>
       
       <Row>
          <Col span={12}>
              <FormItem {...Fields.userNo.userProps}>
              {getFieldDecorator(Fields.userNo.name, { ...Fields.userNo.userRules,initialValue: dataDetail.userNo })(
                <Input />
              )}
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem {...Fields.userName.userProps}>
              {getFieldDecorator(Fields.userName.name, {  ...Fields.userName.userRules,initialValue: dataDetail.userName })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
              <FormItem {...Fields.nickName.userProps}>
              {getFieldDecorator(Fields.nickName.name, { ...Fields.nickName.userRules, initialValue: dataDetail.nickName  })(
              <Input />
              )}
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem {...Fields.phoneNum.userProps}>
              {getFieldDecorator(Fields.phoneNum.name, {  ...Fields.phoneNum.userRules,initialValue: dataDetail.phoneNum })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={30}>
            <FormItem {...Fields.emailAddr.userProps}>
            {getFieldDecorator(Fields.emailAddr.name, {  ...Fields.emailAddr.userRules, initialValue: dataDetail.emailAddr })(
              <Input />
            )}
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem {...Fields.roleCode.userProps}>
                {getFieldDecorator(Fields.roleCode.name, {  ...Fields.roleCode.userRules, initialValue: dataDetail.roleCode })(
                  <Input />
                )}
              </FormItem>        
            </Col>
            <Col span={16}>
            <FormItem {...Fields.departNo.userProps}>
              {getFieldDecorator(Fields.departNo.name, {  ...Fields.departNo.userRules, initialValue: dataDetail.departNo })(
                <Input />
              )}
            </FormItem>
            </Col>
        </Row>  
        
       
      </Form>
    );
  }
}
