import React from 'react'
import { Form, Row, Col, Input, Button, notification, Select } from 'antd'
import { request } from 'utils'

const FormItem = Form.Item;
const Option = Select.Option;

const Fields = {
  roleCode: {
    name: 'roleCode',
    userProps: { label: '角色代码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  roleName: {
    name: 'roleName',
    userProps: { label: '角色名称', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  }, 
};
export default class AdvancedSearchForm extends React.Component {
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
        <FormItem {...Fields.roleCode.userProps}>
          {getFieldDecorator(Fields.roleCode.name, { ...Fields.roleCode.userRules, initialValue: dataDetail.roleCode })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.roleName.userProps}>
          {getFieldDecorator(Fields.roleName.name, { ...Fields.roleName.userRules, initialValue: dataDetail.roleName })(
            <Input />
          )}
        </FormItem>
       
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
      </Form>
    );
  }
}
