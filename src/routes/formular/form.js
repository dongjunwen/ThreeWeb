import React from 'react'
import { Form, Row, Col, Input, Button, notification, Select } from 'antd'
import { request } from 'utils'

const FormItem = Form.Item;
const Option = Select.Option;

const Fields = {
  formularName: {
    name: 'formularName',
    userProps: { label: '公式名称', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  formularNo: {
    name: 'formularNo',
    userProps: { label: '公式代码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  formularType: {
    name: 'formularType',
    userProps: { label: '公式类型', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  formularValue: {
    name: 'formularValue',
    userProps: { label: '公式值', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  formularPrice: {
    name: 'formularPrice',
    userProps: { label: '公式单价', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  memo: {
    name: 'memo',
    userProps: { label: '公式备注', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
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
    const sysDictOptions = this.props.sysDicts.map(sysDict => <Option key={sysDict.dictCode}>{sysDict.dictName}</Option>)

    return (
      <Form
        onSubmit={this.handleSubmit.bind(this)}
      >
        <FormItem {...Fields.formularName.userProps}>
          {getFieldDecorator(Fields.formularName.name, { ...Fields.formularName.userRules, initialValue: dataDetail.formularName })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.formularNo.userProps}>
          {getFieldDecorator(Fields.formularNo.name, { ...Fields.formularNo.userRules, initialValue: dataDetail.formularNo })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.formularType.userProps}>
          {getFieldDecorator(Fields.formularType.name, { ...Fields.formularType.userRules, initialValue: dataDetail.formularType || this.props.sysDicts[0].dictCode })(
            <Select>
              {sysDictOptions}
            </Select>
          )}
        </FormItem>
        <FormItem {...Fields.formularValue.userProps}>
          {getFieldDecorator(Fields.formularValue.name, { ...Fields.formularValue.userRules, initialValue: dataDetail.formularValue })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.formularPrice.userProps}>
          {getFieldDecorator(Fields.formularPrice.name, { ...Fields.formularPrice.userRules, initialValue: dataDetail.formularPrice })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.memo.userProps}>
          {getFieldDecorator(Fields.memo.name, { ...Fields.memo.userRules, initialValue: dataDetail.memo })(
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
