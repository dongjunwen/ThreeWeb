import React from 'react'
import { Table, Form, Row, Col, Input, Button, Select, Modal, Popconfirm, notification } from 'antd'
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import ModalFrom from './form'

const FormItem = Form.Item;
const Option = Select.Option;

// 定义form项目
const Fields = {
  materialType: {
    name: 'materialType',
    userProps: { label: '物料类型', labelCol: { span: 7 }, wrapperCol: { span: 16 } },
  },
  materialName: {
    name: 'materialName',
    userProps: { label: '物料名称', labelCol: { span: 8 }, wrapperCol: { span: 16 } },
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
    const materialOptions = this.props.materials.map(material => <Option key={material.dictCode}>{material.dictName}</Option>)

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSearch.bind(this)}
      >
        <Row>
          <Col span={6}>
            <FormItem {...Fields.materialType.userProps}>
              {getFieldDecorator(Fields.materialType.name, { ...Fields.materialType.userRules, initialValue: this.props.materials[0].dictCode })(
                <Select allowClear>
                  {/* <Option key="1">面料</Option>
                  <Option key="2">纱线</Option>
                  <Option key="3">白纱布</Option>
                  <Option key="4">半成品（染色后的白坯布）</Option>
                  <Option key="5">残次品</Option> */}
                  {materialOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...Fields.materialName.userProps}>
              {getFieldDecorator(Fields.materialName.name, { ...Fields.materialName.userRules })(
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

class MaterialPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      visible: false,
      readOnly: false,
      materials: [{ dictCode: 'dd', dictName: 'dd' }],
    };

    this.columns = [
      {
        title: '品种编号',
        dataIndex: 'materialNo',
      },
      {
        title: '品名',
        dataIndex: 'materialName',
      },
      {
        title: '规格',
        dataIndex: 'spec',
      },
      {
        title: '型号',
        dataIndex: 'pattern',
      },
      {
        title: '单价',
        dataIndex: 'price',
      },
      {
        title: '单位',
        dataIndex: 'unit',
      },
      {
        title: '物料类型',
        dataIndex: 'materialTypeName',
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
            title="确定删除吗?"
            overlayStyle={{ width: '200px' }}
            onConfirm={() => this.deleteRecord(record.materialNo)}
            okText="删除"
            cancelText="取消"
          >
            <a> 删除</a>
          </Popconfirm>
        </div>),
      },
    ];
  }

  componentWillMount() {
    request({
      url: `${config.APIV0}/api/sysDict/MATERIAL_TYPE`,
      method: 'get',
    }).then(data => this.setState({ materials: data.data }));
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
    request({ url: `${config.APIV0}/api/material`, method: 'GET', data: this.condition })
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
    request({ url: `${config.APIV0}/api/material/${id}`, method: 'DELETE' })
      .then(() => this.getList({}))
      .catch(err => notification.error({message: '操作失败', description: err.message}));
  }

  addRecord(data) {
    request({
      url: `${config.APIV0}/api/material`,
      method: this.state.modify ? 'PUT' : 'POST',
      data
    }).then(() => {
      this.setState({
        visible: false,
        dataDetail: {materialName:undefined,materialNo: undefined,materialType: undefined,pattern:undefined,spec: undefined,unit: undefined}
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
        <WrappedAdvancedSearchForm materials={this.state.materials} search={this.getList.bind(this)} setModal={() => this.setModal({}, false, false)} />
        <h2 style={{ margin: '16px 0' }}>查询结果</h2>
        <Table
          bordered
          columns={this.columns}
          dataSource={this.state.data}
          rowKey={(record, key) => key}
          pagination={{ pageSize: this.state.pageSize, onChange: this.getList.bind(this), defaultCurrent: 1, current: this.state.currentPage, total: this.state.total , pageSizeOptions : ['10','50', '100', '150']}}
        />
        <Modal
          visible={this.state.visible}
          title="修改物料信息"
          footer={null}
          onCancel={() => this.setState({ visible: false })}
        >
          <WrappedModalFrom dataDetail={this.state.dataDetail} materials={this.state.materials} readOnly={this.state.readOnly} submit={value => !this.state.readOnly && this.addRecord(value)} />
        </Modal>
      </div>
    )
  }
}

MaterialPage.propTypes = {
  dispatch: PropTypes.func,
}
export default MaterialPage
