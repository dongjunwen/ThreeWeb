import { Table, Form, Row, Col, Input, Button, Select, Icon, notification, DatePicker, AutoComplete } from 'antd';
import PropTypes from 'prop-types'
import { request, config } from 'utils'
import moment from 'moment';
import React from 'react'
import './style.less'

const Option = Select.Option;

class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      editable: false,
      data: [],
    };
  }

  handleChange(e) {
    const value = e.target.value;
    this.setState({value});
  }

  check() {
    this.setState({editable: false});
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }

  edit() {
    this.setState({editable: true});
  }

  formatDate(date, dateString) {
    this.setState({value: dateString});
    setTimeout(() => {
      this.check();
    }, 0);
  }

  autoSelect(value) {
    this.setState({value: /^\d+/.exec(value)[0]});
    setTimeout(() => {
      this.check();
    }, 0);
  }

  handleAutoComplete(value, source, record) {
    if (source === 'Formular') {
      request({
        url: `${config.APIV0}/api/formular/findFormularLike/`,
        method: 'post',
        data: {
          condStr: value,
          longNum: record.prodLong,
          widhtNum: record.prodWidth,
          reqNum: record.prodNum,
        },
      }).then(data => this.setState({
        data: data.data || [],
      }));
    } else {
      request({
        url: `${config.APIV0}/api/${source.toLowerCase()}/find${source}Like/${value}`,
        method: 'get',
      }).then(data => this.setState({
        data: data.data || [],
      }));
    }
  }

  handleSelectAutoComplete(value, source) {
    const {data} = this.state;
    this.setState({editable: false, value: value.split(/\s/)[0]});
    if (this.props.onChange) {
      this.props.onSelect(data[data.findIndex(item => item[`${source.toLowerCase()}No`] === value.split(/\s/)[0])])
    }
  }

  // switchInputElement(value) {
  //   const {type, source} = this.props;
  //   switch (type) {
  //     case 'autoComplete':
  //       return (<AutoComplete
  //         dataSource={this.state.data.map(item => item[`${source.toLowerCase()}No`] + ' ' + item[`${source.toLowerCase()}Name`])}
  //         onSearch={(value) => this.handleAutoComplete(value, source)}
  //         onSelect={(value) => this.handleSelectAutoComplete(value, source)}
  //       />);
  //       break;
  //     case 'input':
  //     default:
  //       return (<Input
  //         value={value}
  //         onChange={this.handleChange.bind(this)}
  //         onPressEnter={this.check.bind(this)}
  //         onBlur={this.check.bind(this)}
  //       />);
  //       break;
  //   }
  // }

  switchInputType(value, type, column, source, record, sourceData) {
    const dateFormat = 'YYYY-MM-DD';
    // autoCompleteWidth用来标示自动补全框的宽度
    const autoCompleteWidth = this.props.width ? this.props.width : 'auto';

    switch (type) {
      case 'autoComplete':
        return (<AutoComplete
          value={value}
          style={{ margin: '-5px 0', width: autoCompleteWidth }}
          onChange={value => this.props.onChange(value.split(/\s/)[0])}
          dataSource={this.state.data.map(item => item[`${source.toLowerCase()}No`] + ' ' + item[`${source.toLowerCase()}Name`])}
          onSearch={value => this.handleAutoComplete(value, source, record)}
          onSelect={value => this.handleSelectAutoComplete(value, source)}
        />)
        break;
      case 'select':
        return (<Select
          // labelInValue
          value={value}
          style={{ margin: '-5px 0', minWidth: 80 }}
          onChange={value => this.props.onChange(value)}
        >
          {sourceData.map(item => <Option key={item.value}>{item.label}</Option>)}
        </Select>)
        break;
      case 'datePicker':
        return (<DatePicker
          allowClear={false}
          format={dateFormat}
          style={{ margin: '-5px 0' }}
          value={moment(value, dateFormat)}
          onChange={(data, dateString) => this.props.onChange(dateString)}
        />)
      case 'input':
      default:
        return (<Input
          value={value}
          style={{ margin: '-5px 0' }}
          onChange={e => this.props.onChange(e.target.value)}
        />)
        break;
    }
  }

  render() {
    // const {value, editable} = this.state;
    const { editable, value, onChange, type, column, source, record, sourceData } = this.props;
    // const disabledDate = {
    //   dateStart: (currentValue, record) => {
    //     if ((!record.beginTime && !record.endTime) || currentValue === undefined) {
    //       return false;
    //     }
    //     return currentValue.valueOf() > (new Date(record.endTime)).valueOf() + 86400000;
    //   },
    //   dateEnd: (currentValue, record) => {
    //     if ((!record.beginTime && !record.endTime) || currentValue === undefined) {
    //       return false;
    //     }
    //     return currentValue.valueOf() <= (new Date(record.beginTime)).valueOf();
    //   }
    // };
    // todo: 检查为何修改外层value时内层未同步更新

    return (<div>
      {editable
        ? this.switchInputType(value, type, column, source, record, sourceData)
        : value
      }
    </div>);
  }
}

EditableCell.propTypes = {
  value: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
}

export default EditableCell
