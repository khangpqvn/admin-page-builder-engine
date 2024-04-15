import React, { Component } from 'react';
import {
    Input, Button, Row, Col
} from 'reactstrap';
import _ from 'lodash';
const dataTypes = ['string', 'number']

class ArrayEditor extends Component {
    constructor(props) {
        super(props);
        let type = 'string';
        if (props.value && props.value.length > 0) {
            type = typeof (props.value[0].value);
        }
        this.state = {
            type,
            data: props.value || []
        }

    }
    componentWillReceiveProps(next) {
        this.setState({ data: next.value || [] })
    }
    fixData(data, type) {
        if (type === 'number') {
            if (data) {
                data.map(d => {
                    d.value = Number(d.value);
                    return d;
                })
            }
        } else {
            if (data) {
                data.map(d => {
                    d.value = d.value + '';
                    return d;
                })
            }
        }
        if (this.props.onchange) {
            this.props.onChange(data);
        }
        return data;
    }
    addItem() {
        let data = _.clone(this.state.data);
        let value = this.state.type === 'number' ? 0 : '';
        data.push({ key: '', value });
        this.setState({ data });
    }
    removeItem(index) {
        let data = _.clone(this.state.data);
        data.splice(index, 1);
        this.setState({ data });
        if (this.props.onChange) {
            this.props.onChange(this.fixData(data, this.state.type));
        }
    }
    onItemDataChange(index, name, val) {
        let data = _.clone(this.state.data);
        let item = data[index];
        item[name] = val;
        data[index] = item;
        this.setState({ data });
        if (this.props.onChange) {
            this.props.onChange(this.fixData(data, this.state.type));
        }
    }
    render() {
        return (<div>
            <Row>
                <Col md={8}>
                    <Input type="select"
                        value={this.state.type}
                        onChange={e => {
                            this.state.type = e.target.value;
                            if (this.props.onChange) {
                                this.props.onChange(this.fixData(_.clone(this.state.data), this.state.type));
                            }
                        }}>
                        {dataTypes.map((d, index) => <option key={d} value={d} >{d}</option>)}
                    </Input>
                </Col>
                <Col md={4}>
                    <Button block onClick={this.addItem.bind(this)}><i className='fa fa-plus' /> Thêm</Button>
                </Col>
            </Row>
            {this.state.data.map((item, index) => {
                return <Row className='mt-1' key={index}>
                    <Col xs={4}>
                        <Input type='text' value={item.key} placeholder={'Khóa'} onChange={e => { this.onItemDataChange(index, 'key', e.target.value) }} />
                    </Col>
                    <Col xs={4}>
                        <Input type='text' value={item.value} placeholder={'Giá trị'} onChange={e => { this.onItemDataChange(index, 'value', e.target.value) }} />
                    </Col>
                    <Col xs={4}>
                        <Button block color={'danger'} onClick={e => { this.removeItem(index) }}><i className='fa fa-remove' /> Xóa</Button>
                    </Col>
                </Row>
            })}
        </div>)
    }
}

export default ArrayEditor;
