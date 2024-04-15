import React, { Component } from 'react';
import FormSchema from './index';
import helper from '../services/helper'
import { Button, Row, Col, CardBody, Card, CardHeader, CardFooter } from 'reactstrap';
import _ from 'lodash';
class FormView extends Component {
    constructor(props) {
        super(props);
        let pageInfo = helper.getPageSync(props.schema.page)
        // console.log({ props })
        this.state = {
            value: props.value || [{}],
            data: props.data || {},
            pageInfo,
            key: props.schema.field,
            submitted: props.submitted,
        }
        // console.log({ state: this.state })
    }
    componentWillReceiveProps(next) {
        this.setState({ value: next.value || [{}], data: next.data, submitted: next.submitted })
    }
    checkError() {
        if (this.formRef) {
            for (let i = 0; i < this.state.value.length; i++) {
                const formRef = this.formRef[i];
                let a = formRef.checkError();
                if (a.message)
                    return a.message;
            }

        }
        return undefined;
    }
    formRef = []
    addItem() {
        this.state.value.push({});
        this.setState(this.state);
    }
    removeItem(index) {
        this.state.value.splice(index, 1);
        this.formRef.splice(index, 1);


        //    _.remove(this.formRef)

        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    onItemDataChange(index, val) {
        this.state.value[index] = val;
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }

    render() {
        return (<Card >
            <CardHeader>
                <h5>{this.props.schema.name} {this.props.schema.required ? '(*)' : ''}</h5>
            </CardHeader>
            <CardBody >

                {this.state.value.map((v, index) => {
                    if (index !== 0)
                        return (
                            <React.Fragment key={index}>
                                <hr/>
                                <Row className='mt-1' key={index}>
                                    <Col xs={11}>
                                        <FormSchema
                                            key={index}
                                            ref={ref => { this.formRef[index] = ref; }}
                                            schema={this.state.pageInfo.schema}
                                            mode={'create'}
                                            data={this.state.value[index] || {}}
                                            onChange={value => {
                                                if (this.props.onChange) {
                                                    this.onItemDataChange(index, value);
                                                }
                                            }}
                                            submitted={this.props.submitted || false}
                                        >
                                        </FormSchema>
                                    </Col>
                                    <Col xs={1}>
                                        <Button block color={'danger'} disabled={this.props.schema.disabled} onClick={e => { this.removeItem(index) }}><i className='fa fa-remove' /> </Button>
                                    </Col>
                                </Row>
                            </React.Fragment>
                        )
                    else
                        return (
                                <Row className='mt-1' key={index}>
                                    <Col xs={11}>
                                        <FormSchema
                                            key={index}
                                            ref={ref => { this.formRef[index] = ref; }}
                                            schema={this.state.pageInfo.schema}
                                            mode={'create'}
                                            data={this.state.value[index] || {}}
                                            onChange={value => {
                                                if (this.props.onChange) {
                                                    this.onItemDataChange(index, value);
                                                }
                                            }}
                                            submitted={this.props.submitted || false}
                                        >
                                        </FormSchema>
                                    </Col>
                                    <Col xs={1}>
                                        <Button block color={'danger'} disabled={this.props.schema.disabled} onClick={e => { this.removeItem(index) }}><i className='fa fa-remove' /> </Button>
                                    </Col>
                                </Row>
                        )
                })
                }
            </CardBody>

            {(this.props.schema.disabled) ? null :
                <CardFooter>
                    < Row className='mt-2' >
                        <Col md={12} >
                            <Button block outline color={'primary'} onClick={this.addItem.bind(this)}><i className='fa fa-plus' /> {this.props.schema.addButonName || 'Thêm'}</Button>
                        </Col>
                    </ Row>
                </CardFooter>
            }

        </Card>)
    }
}

export default FormView;