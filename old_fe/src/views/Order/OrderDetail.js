import React, { Component } from 'react';
import {
    Button, Card, CardBody, Col, Input, Row, FormGroup, Label, CardHeader,
    Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import _ from 'lodash'
import helper from '../../services/helper';
import queryString from 'qs';
import Widgets from '../../schema/Widgets';
import Loader from '../../controls/Loader';
import FormCtrl from '../../controls/FormCtrl';

class OrderDetail extends Component {
    constructor(props) {
        super(props);
        let query = queryString.parse(this.props.location.search, { ignoreQueryPrefix: true });
        this.query = _.cloneDeep(query)
        this.state = {
            loading: true,
            orderId: query.orderId,
            attachment: null,
        };
    }
    async loadComment() {


    }
    componentDidMount() {
        this.loadComment()
    }
    componentWillReceiveProps(next) {

    }

    render() {
        if (this.state.loading) return <Loader />
        let query = { page: this.query.page, mode: 'edit', id: this.query.orderId, embed: "{\"showCaptcha\":false,\"mode\":\"view\"}" };
        return (<Card>
            <CardBody>
                <Row>
                    <Col xs="12" sm="12" md="12">
                        <FormCtrl query={query} />
                    </Col>
                    <Col xs="12" sm="12" md="12">
                        
                    </Col>
                </Row>
            </CardBody>
        </Card>)
    }
}

export default OrderDetail;
