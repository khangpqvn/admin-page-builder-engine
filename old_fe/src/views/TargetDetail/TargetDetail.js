import _ from 'lodash';
import moment from 'moment';
import queryString from 'qs';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row, CardFooter } from 'reactstrap';
import FormCtrl from '../../controls/FormCtrl';
import Loader from '../../controls/Loader';
import Helper from '../../services/helper';
import request from '../../services/request';
import LoadingOverlay from 'react-loading-overlay';
import ListCtrl from '../../controls/ListCtrl';

let reloadData = false;
class TargetDetail extends Component {
    query = {};
    //test: http://127.0.0.1:3000/#/ordercomment?orderid=1&page=36
    constructor(props) {
        super(props);
        let query = queryString.parse(props.location.search, { ignoreQueryPrefix: true });
        this.query = _.cloneDeep(query)
        this.state = {
            targetId: query.targetId,
        }

    }
    componentDidMount() {
        // setInterval(() => {
        //     this.setState({ reloadData: !(this.state.reloadData) })
        // }, 10000);
    }

    // onReloadData() {
    //     setTimeout(() => {
    //         console.log('onreload')
    //         reloadData = !reloadData
    //         this.setState({ reloadData });
    //     }, 3000);

    // }

    render() {
        // if (this.state.loading) return <Loader />
        // let reload = 

        return (
            <div className="animated fadeIn">
                <Row >
                    <Col style={{ maxHeight: "59vh", overflowY: "auto" }} md="7" xs="7">
                        <FormCtrl query={{ page: 43, mode: 'edit', id: this.state.targetId, embed: '{"mode":"view"}' }} />
                    </Col>
                    <Col style={{ maxHeight: "59vh", overflowY: "auto" }} md="5" xs="5">
                        <ListCtrl query={{ page: 46, itemsPerPage: 5, hideButton: true, filter: `{"target":${this.state.targetId}}`, embed: `{"target":${this.state.targetId}}` }} />
                    </Col>
                </Row>
                <Row style={{ maxHeight: "40vh", overflowY: "auto", marginTop: '1vh' }}>
                    <Col md="12" xs="12">
                        <ListCtrl query={{ page: 45, itemsPerPage: 5, filter: `{"target":${this.state.targetId}}`, embed: `{"target":${this.state.targetId}}` }} />
                    </Col>
                </Row>
            </div >
        );
    }

}


export default TargetDetail;