import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Row } from 'reactstrap';
import helper from '../services/helper';
import FormSchema from '../schema';
import VoucherPreview from './VoucherPreview';
import Loader from './Loader';
class VoucherApprove extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            pageInfo: null,
            error: null,
            loading: true
        }
        this.loadData(props);
    }
    componentDidMount() {
        // this.loadData(this.props);
    }
    componentWillReceiveProps(next) {
        this.loadData(next);
    }
    async loadData(props) {
        let pageInfo = await helper.getPage(props.query.page);
        console.log('PAGE INFO', pageInfo);
        this.setState({
            pageInfo,
            mode: props.query.mode
        });
        let rs = await helper.callPageApi(pageInfo, pageInfo.read, { queryInput: JSON.stringify({ voucher: props.query.voucher }) });
        let data = rs.data[0];
        if (props.query.embed) {
            Object.assign(data, JSON.parse(props.query.embed));
        }
        this.setState({ data, loading: false })
    }
    onChange(data) {
        this.setState({ data });
    }
    async onSubmit() {
        this.onButtonClick();
    }
    async onButtonClick(btnInfo) {
        if (!btnInfo) {
            for (var i = 0; i < this.state.pageInfo.buttons.length; i++) {
                if (this.state.pageInfo.buttons[i].mode === this.props.query.mode) {
                    btnInfo = this.state.pageInfo.buttons[i];
                    break;
                }
            }
        }

        if (btnInfo) {
            try {
                let data = Object.assign({}, this.state.data);
                if (btnInfo.confirm) {
                    let confirmText = btnInfo.confirm;
                    for (var f in data) {
                        confirmText = helper.replaceAll(confirmText, '#' + f + '#', data[f]);
                    }
                    let rs = await helper.confirm(confirmText);
                    console.log('confirm', rs);
                    if (!rs) return;
                }
                if (this.props.query.embed && btnInfo.embedUrl) {
                    data = Object({}, data, JSON.stringify(this.props.query.embed));
                }
                let response = await helper.callPageApi(this.state.pageInfo, btnInfo.api, data);
                helper.alert(response.message || 'Thành công');
                this.loadData(this.props);
            } catch (err) {
                helper.alert(err.message);
            }
        } else {
            helper.alert('Không có nút bấm');
        }
    }
    async createNewApprove() {
        await helper.callPageApi(this.state.pageInfo, 'create_approve', { voucher: this.props.query.voucher });
        this.loadData(this.props);
    }
    render() {
        if (this.state.loading) return <p>Đang tải dữ liệu...</p>
        if (!this.state.data) return <Row>
            <Col md={6}>
                <VoucherPreview query={Object.assign({}, this.props.query, { type: 1 })} />
            </Col>
            <Col md={6}>
                <h3 className='text-danger'>Chưa duyệt</h3>
                <Button color='primary' onClick={this.createNewApprove.bind(this)}>Duyệt ưu đãi</Button>
            </Col>
        </Row>
        if (!this.state.pageInfo) return <Loader />
        return (
            <Row>
                <Col md={6}>
                    <VoucherPreview query={Object.assign({}, this.props.query, { type: 1 })} />
                </Col>
                <Col md="6">
                    <CardGroup>
                        <Card>
                            <CardBody>
                                <h3 className='text-success'>Đã duyệt</h3>
                                <FormSchema
                                    schema={this.state.pageInfo.schema}
                                    data={this.state.data || {}}
                                    onChange={data => {
                                        this.setState({ data })
                                    }}
                                    onSubmit={this.onSubmit.bind(this)}>
                                    {this.state.pageInfo.buttons.map((item, index) => {
                                        if (this.state.mode === item.mode) {
                                            return <Button key={index} color={item.color} type={item.type} onClick={() => { if (item.type === 'button') this.onButtonClick(item) }} className='mr-1'><i className={item.icon} /> {item.title}</Button>
                                        }
                                        return null;
                                    })}
                                    <a href={`#/form?page=45&mode=import&embed=%7B%22voucher%22%3A${this.props.query.voucher}%7D`} className='btn btn-info mr-1'><i className='fa fa-phone' /> Nhập số điện thoại</a>
                                </FormSchema>
                            </CardBody>
                        </Card>
                    </CardGroup>
                </Col>
            </Row>
        );
    }
}

export default VoucherApprove;
