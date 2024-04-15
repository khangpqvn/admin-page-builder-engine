import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import helper from '../services/helper';
import Moment from 'react-moment';
import Loader from './Loader';
export default class VoucherPreview extends Component {
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
        let pageInfo = await helper.getPage(54);
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
        if (!this.state.blockMessage) return helper.alert('Vui lòng nhập lý do chặn');
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
                <Col md={12}>
                    <div className='phone-simulator'>
                        <div className='banner-container mb-2'>
                            <img className='img-full' src={this.state.data.voucherInfo.images[0]} alt='Chưa có hình ảnh' />
                            <div className='voucher-value'>
                                {this.state.data.voucherInfo.exchangePoint || 0} điểm &nbsp;&nbsp;&nbsp;
                                {this.state.data.voucherInfo.value} &nbsp;&nbsp;&nbsp;
                                Áp dụng tới <Moment format="DD/MM/YYYY">{this.state.data.voucherInfo.endDate}</Moment>
                            </div>
                            {/* <img className='partner-logo' src={this.state.data.partnerInfo.logo} alt='Chưa có hình ảnh' /> */}
                        </div>
                        <p>[{this.state.data.partnerInfo.name}] {this.state.data.voucherInfo.name}</p>
                        <pre> {this.state.data.voucherInfo.description}</pre>
                        <p><b>Thông tin đối tác</b></p>
                        <pre> {this.state.data.partnerInfo.detail}</pre>
                        <p><b>Hotline:</b> {this.state.data.voucherInfo.hotLine}</p>
                        <p><b>Thời gian áp dụng: </b>
                            Từ <Moment format="DD/MM/YYYY">{this.state.data.voucherInfo.startDate}</Moment>&nbsp;
                            đến <Moment format="DD/MM/YYYY">{this.state.data.voucherInfo.endDate}</Moment>
                        </p>
                        <p><b>Địa điểm áp dụng:</b></p>
                        {this.state.data.shopInfos.map((s, index) => {
                            return <div key={index}>
                                <span><b>{s.name}</b></span><br />
                                <p>{s.address}</p>
                            </div>
                        })}
                    </div>
                </Col>
            </Row>
        );
    }
}
