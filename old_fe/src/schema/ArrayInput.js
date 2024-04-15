import React, { Component } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import Text from './Text';
import _ from 'lodash';
class ArrayInput extends Component {
    constructor(props) {
        super(props);
        let type = props.schema.type;

        this.state = {
            type,
            data: props.value || []
        }
        if (!this.state.data.length) {
            this.addItem()
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ data: next.value || [this.state.type == 'number' ? 0 : ''] })
    }
    fixData(data, type) {
        if (type === 'number') {
            if (data) {
                data = data.map(d => {
                    return Number(d);
                })
            }
        } else {
            if (data) {
                data = data.map(d => {
                    return d + '';
                })
            }
        }

        return data;
    }
    addItem() {
        let data = _.clone(this.state.data);
        let value = this.state.type === 'number' ? 0 : '';
        data.push(value);
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
    onItemDataChange(index, val) {
        let data = _.clone(this.state.data);

        data[index] = val;
        if (this.props.onChange) {
            this.props.onChange(this.fixData(data, this.state.type));
        }
    }
    render() {
        return (
            <div>
                {this.state.data.map((item, index) => {
                    return <Row className='mt-1' key={index}>
                        <Col xs={this.props.schema.disabled ? 12 : 10}>
                            <Text  {...this.props} value={item} onChange={(e) => {
                                this.onItemDataChange(index, e)
                            }} />
                        </Col>
                        {
                            this.props.schema.disabled ? null :
                                <Col xs={2}>
                                    <Button block color={'danger'} disabled={this.props.schema.disabled} onClick={e => { this.removeItem(index) }}><i className='fa fa-remove' /></Button>
                                </Col>
                        }

                    </Row>
                })}
                {(this.props.schema.disabled) ? null :
                    < Row className='mt-2' >
                        <Col md={12} >
                            <Button block onClick={this.addItem.bind(this)}><i className='fa fa-plus' /> {this.props.schema.addButonName || 'Thêm'}</Button>
                        </Col>
                    </ Row>
                }
            </div >
        )
    }
}

export default ArrayInput;