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
       
    }
    render() {

        return (<React.Fragment>
        </React.Fragment>)
    }
}

export default PageDetail;