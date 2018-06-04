import React from 'react'
import { Form, Row, Col, Input, Button, notification, Select } from 'antd'
import { request } from 'utils'

const FormItem = Form.Item;
const Option = Select.Option;

const Fields = {
  materialName: {
    name: 'materialName',
    userProps: { label: '物料名称', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  materialNo: {
    name: 'materialNo',
    userProps: { label: '物料编码', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  materialType: {
    name: 'materialType',
    userProps: { label: '物料类型', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  memo: {
    name: 'memo',
    userProps: { label: '备注', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  pattern: {
    name: 'pattern',
    userProps: { label: '物料型号', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  spec: {
    name: 'spec',
    userProps: { label: '物料规格', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  price: {
    name: 'price',
    userProps: { label: '单价', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  unit: {
    name: 'unit',
    userProps: { label: '物料单位', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  materialLong: {
    name: 'materialLong',
    userProps: { label: '长', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
  },
  materialWidth: {
    name: 'materialWidth',
    userProps: { label: '宽', labelCol: { span: 6 }, wrapperCol: { span: 16 } },
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
    const materialOptions = this.props.materials.map(material => <Option key={material.dictCode}>{material.dictName}</Option>)

    return (
      <Form
        onSubmit={this.handleSubmit.bind(this)}
      >
        <FormItem {...Fields.materialName.userProps}>
          {getFieldDecorator(Fields.materialName.name, { ...Fields.materialName.userRules, initialValue: dataDetail.materialName })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.materialNo.userProps}>
          {getFieldDecorator(Fields.materialNo.name, { ...Fields.materialNo.userRules, initialValue: dataDetail.materialNo })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.materialType.userProps}>
          {getFieldDecorator(Fields.materialType.name, { ...Fields.materialType.userRules, initialValue: dataDetail.materialType || this.props.materials[0].dictCode })(
            <Select>
              {materialOptions}
            </Select>
          )}
        </FormItem>
        <FormItem {...Fields.pattern.userProps}>
          {getFieldDecorator(Fields.pattern.name, { ...Fields.pattern.userRules, initialValue: dataDetail.pattern })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.spec.userProps}>
          {getFieldDecorator(Fields.spec.name, { ...Fields.spec.userRules, initialValue: dataDetail.spec })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.price.userProps}>
          {getFieldDecorator(Fields.price.name, { ...Fields.price.userRules, initialValue: dataDetail.price })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.unit.userProps}>
          {getFieldDecorator(Fields.unit.name, { ...Fields.unit.userRules, initialValue: dataDetail.unit })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.materialLong.userProps}>
          {getFieldDecorator(Fields.materialLong.name, { ...Fields.materialLong.userRules, initialValue: dataDetail.materialLong })(
            <Input />
          )}
        </FormItem>
        <FormItem {...Fields.materialWidth.userProps}>
          {getFieldDecorator(Fields.materialWidth.name, { ...Fields.materialWidth.userRules, initialValue: dataDetail.materialWidth })(
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
