import React from 'react'
import { Form, Row, Col, Input, Button, notification, Radio } from 'antd'
import { request } from 'utils'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const Fields = {
  departNo: {
    name: 'departNo',
    userProps: { label: '部门编码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  departName: {
    name: 'departName',
    userProps: { label: '部门名称', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  fhDepartNo: {
    name: 'fhDepartNo',
    userProps: { label: '上级部门', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  compNo: {
    name: 'compNo',
    userProps: { label: '公司编码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
};
export default class AdvancedSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marketNo: '',
    };
  }

  setModal() {
    console.log(this);
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
        <FormItem {...Fields.departNo.userProps}>
          {getFieldDecorator(Fields.departNo.name, { ...Fields.departNo.userRules })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.departName.userProps}>
          {getFieldDecorator(Fields.departName.name, { ...Fields.departName.userRules })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.fhDepartNo.userProps}>
          {getFieldDecorator(Fields.fhDepartNo.name, { ...Fields.fhDepartNo.userRules })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.compNo.userProps}>
          {getFieldDecorator(Fields.compNo.name, { ...Fields.compNo.userRules })(
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
