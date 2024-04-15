import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader, Col, Label, FormGroup, Row, Input
} from 'reactstrap';
import NumberFormat from 'react-number-format';
import services from './services';
import _ from 'lodash';
class PageDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: this.props.data.category || [],
            categoryObj: {},
            value: this.props.value || {},
            error: {}
        }
    }
    componentWillReceiveProps(next) {
        if (!_.isEqual(next.data.category || [], this.state.category)) {
            this.fetchData(next.data.category)
        } else
            if (!_.isEqual(next.value, this.state.value)) {
                this.setState({ value: next.value || {} })
            }
    }
    componentDidMount() {
        this.fetchData(this.state.category);
    }
    isInvalid() {
        let { category, value } = this.state;
        let error = {}
        if (!category) return;
        for (let i = 0; i < category.length; i++) {
            const catId = category[i];
            if (!value[catId] || value[catId].from === undefined || value[catId].to === undefined || value[catId].to < value[catId].from) {
                error[catId] = 'Missing or invalid page of category'
            }
        }
        this.setState({ error })
    }

    checkError() {
        let { category, value } = this.state;
        for (let i = 0; i < category.length; i++) {
            const catId = category[i];
            if (!value[catId] || value[catId].from === undefined || value[catId].to === undefined || value[catId].to < value[catId].from) {
                return `Wrong or missing data for ${this.props.schema.name}!`
            }
        }
    }
    async fetchData(listCategory) {
        try {
            if (!listCategory) return;
            let rs = await services.getCategory({ where: JSON.stringify({ id: listCategory.length ? listCategory : [0] }) })
            let categoryObj = {};
            rs.data.map(v => {
                categoryObj[v.id] = v;
                return;
            })
            this.setState({ categoryObj, category: listCategory })
        } catch (error) {
            // this.setState({ categoryObj: {}, category: listCategory })
        }
    }
    render() {
        let { categoryObj, category, value } = this.state;
        return (<React.Fragment>{
            value && category && category.length && Object.keys(categoryObj).length === category.length ?
                <FormGroup row>
                    <Col md='3' className='form-label-horizontal'>
                        <Label><b>{this.props.schema.name} {this.props.schema.required ? '(*)' : ''}</b></Label>
                    </Col>
                    <Col md='9'>
                        <Row>
                            {category.map((v, index) => {
                                return <Col md='6' key={v}>
                                    <Card>
                                        <CardHeader>
                                            <h4>{(categoryObj[v] || { code: v }).code + ' -- ' + (categoryObj[v] || { name: v }).name}</h4>
                                        </CardHeader>
                                        <CardBody>
                                            <Row>
                                                <Col md='6'>
                                                    <Label>
                                                        From page
                                                    </Label>
                                                    <NumberFormat key={'NumberFormat' + v}
                                                        value={(value[v] || {}).from}
                                                        customInput={Input}
                                                        thousandSeparator={true}
                                                        isAllowed={(values) => {
                                                            const { value } = values;
                                                            return value >= 0;
                                                        }}
                                                        disabled={this.props.disabled || false}
                                                        invalid={!!this.props.invalid || false}
                                                        type='text'
                                                        onValueChange={(values) => {
                                                            // const { formattedValue, value } = values;
                                                            let value = this.state.value;
                                                            value[v] = value[v] ? Object.assign(value[v], { from: +values.value }) : { from: +values.value };
                                                            if (this.props.onChange) {
                                                                this.props.onChange(value);
                                                            }
                                                        }}
                                                        placeholder={'From page'}
                                                    />
                                                </Col>
                                                <Col md='6'>
                                                    <Label>
                                                        To page
                                                    </Label>
                                                    <NumberFormat key={'NumberFormat' + v}
                                                        value={(value[v] || {}).to}
                                                        customInput={Input}
                                                        isAllowed={(values) => {
                                                            const { value } = values;
                                                            return value >= 0;
                                                        }}
                                                        type='text'
                                                        thousandSeparator={true}
                                                        disabled={this.props.disabled || false}
                                                        invalid={!!this.props.invalid || false}
                                                        onValueChange={(values) => {
                                                            // const { formattedValue, value } = values;
                                                            let value = this.state.value;
                                                            value[v] = value[v] ? Object.assign(value[v], { to: +values.value }) : { to: +values.value };
                                                            if (this.props.onChange) {
                                                                this.props.onChange(value);
                                                            }
                                                        }}
                                                        placeholder={'To page'}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col >
                                                    <div className='text-danger' align="center"><b> {this.state.error[v] || ' '}</b></div>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                            })}
                        </Row>
                    </Col>

                </FormGroup> : null
        }</React.Fragment>)
    }
}

export default PageDetail;