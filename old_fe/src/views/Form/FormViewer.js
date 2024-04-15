import React, { Component } from 'react';
import queryString from 'qs';
import FormCtrl from '../../controls/FormCtrl';
import { Card, CardBody, CardGroup, Col, Row } from 'reactstrap';
export default class FormViewer extends Component {
    constructor(props) {
        super(props);
        let query = queryString.parse(props.location.search, { ignoreQueryPrefix: true })
        this.state = {
            query
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ query: queryString.parse(next.location.search, { ignoreQueryPrefix: true }) });
    }
    render() {
        return (
            <Row>
                <Col md="12">
                    <CardGroup>
                        <Card>
                            <CardBody>
                                <FormCtrl query={this.state.query} />
                            </CardBody>
                        </Card>
                    </CardGroup>
                </Col>
            </Row>

        );
    }
}
