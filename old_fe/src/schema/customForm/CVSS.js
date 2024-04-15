import React, { Component } from 'react';
import {
    Label, Row, Col
} from 'reactstrap';
import NumberFormat from 'react-number-format';
import services from './services';
import cvss from 'cvss';
import _ from 'lodash';
class CVSS extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thisDataKey: props.schema.field,
            data: props.data || {}
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ data: next.data })
    }
    componentDidMount() {

    }
    isInvalid() {

    }

    checkError() {

    }

    render() {
        let score=cvss.getBaseScore(this.state.data[this.state.thisDataKey])
        return (
            <Row>
                <Col xs={3}></Col>
                <Col xs={4}>
                    <h5>Base Score:  {score}</h5>
                </Col>
                <Col xs={5}>
                    <h5>Rating: {cvss.getRating(score)}</h5> 
                </Col>
            </Row>
        )
    }
}

export default CVSS;