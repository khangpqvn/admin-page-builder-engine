import React, { Component } from 'react';
import { Button, Row, Col, Label, Input } from 'reactstrap';
import helper from '../services/helper';
import Loader from './Loader';
import VoucherPreview from './VoucherPreview';
export default class SyncVoucherCtrl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            pageInfo: null,
            error: null,
            blockMessage: ''
        }
    }
    componentDidMount() {
        this.loadData();
    }
    componentWillReceiveProps(next) {
        this.loadData(next);
    }
    async loadData(props) {
        if (!props) props = this.props;
        let pageInfo = await helper.getPage(props.query.page);
        console.log('PAGE INFO', pageInfo);
        this.setState({
            pageInfo,
            mode: props.query.mode
        });
        let rs = await helper.callPageApi(pageInfo, pageInfo.read, props.query);
        this.setState({ data: rs.data, blockMessage: rs.data.voucherInfo.blockMessage })
    }
    async syncVoucher() {
        let rs = await helper.callPageApi(this.state.pageInfo, 'sync-voucher', { id: this.state.data.voucherInfo.id });
        helper.alert(rs.message);
    }
    async blockVoucher() {
        if (!this.state.blockMessage) return helper.alert('Vui lòng nhập lý do từ chối');
        let rs = await helper.callPageApi(this.state.pageInfo, 'block-voucher', { id: this.state.data.voucherInfo.id, blockMessage: this.state.blockMessage });
        helper.alert(rs.message);
    }
    handleInput(evt) {
        let { name, value } = evt.target;
        this.setState({ [name]: value });
    }
    render() {
        if (!this.state.pageInfo || !this.state.data) return <Loader />;
        return (
            <Row>
                <Col md={6}>
                    <VoucherPreview query={this.props.query} />
                </Col>
                <Col>
                    <Button color='success' block onClick={this.syncVoucher.bind(this)}><i className='icon-cloud-download' /> Đồng bộ</Button>
                    <Label className='mt-5'>Lý do từ chối:</Label>
                    <Input type='textarea' className='mb-2' value={this.state.blockMessage} name='blockMessage' onChange={this.handleInput.bind(this)}></Input>
                    <Button color='danger' block onClick={this.blockVoucher.bind(this)}><i className='icon-ban' /> Từ chối</Button>
                </Col>
            </Row>
        );
    }
}
