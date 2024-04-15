import React, { Component } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Input,
    InputGroup, InputGroupAddon
} from 'reactstrap';
import Helper from '../../services/helper';
import local from '../../services/local'
import qs from 'qs';
import request from '../../services/request';
import moment from 'moment';
class Reply extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listReply: props.listReply || [],
            listComment: props.listComment,
            orderId: props.orderId,
            commentId: props.commentId,
            skip: 0,
            limit: 6,
            readmore: false,
            content: ''
        }

        if (this.state.listReply.length > 2) {
            this.state.skip = 2
            this.state.readmore = true;
            this.state.listReply.length = 2;
        } else {
            this.state.skip = this.state.listReply.length;
        }
        // console.log({ skip: this.state.skip, limit: this.state.limit })
        // this.setState(this.state);
    }
    async handleSubmitFormReply() {
        try {
            if (!this.state.content) {
                return;
            }
            let formData = { orderId: this.state.orderId, parent: this.state.commentId, content: this.state.content };
            let rs = await request.request(`/api/comment/order/reply`, formData, { 'api-version': 'common' }, "POST");
            this.state.listReply = [rs].concat(this.state.listReply);
            this.state.skip += 1;
            this.state.content = '';
            this.setState(this.state);
        } catch (error) {
            Helper.alert(error.message);
        }
    }

    handleLoadmore() {
        this.state.skip = this.state.listReply.length;
        this.loadDataReply();
    }
    async loadDataReply() {
        let query = {
            orderId: this.state.orderId,
            commentId: this.state.commentId,
            limit: this.state.limit,
            skip: this.state.skip
        }
        let url = '/api/comment/order/find?' + qs.stringify(query);
        // console.log({ url, query })
        let rs = await request.request(url, {}, { 'api-version': 'common' }, 'GET');

        if (rs.data.length > (this.state.limit - 1)) {
            rs.data.pop();
            this.state.readmore = true;
        } else {
            this.state.readmore = false;
        }
        this.state.listReply = (this.state.listReply || []).concat(rs.data);

        this.setState(this.state);
    }
    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.handleSubmitFormReply()
        }
    }

    render() {
        return <React.Fragment>
            <InputGroup className="mt-3">
                <Input type="text" placeholder="Reply" value={this.state.content} onKeyDown={this._handleKeyDown} onChange={(e) => { this.setState({ content: e.target.value }) }} ></Input>
                <InputGroupAddon addonType="append" >
                    <Button type='button' disabled={!this.state.content} color="primary" onClick={this.handleSubmitFormReply.bind(this)}><i className='fa fa-send' /></Button>
                </InputGroupAddon>
            </InputGroup>
            <div className="mt-3 ">
                {this.state.listReply.map((v, i) => {
                    return (<div key={'reply-' + v.id} className="ml-3 mt-2" >
                        <hr></hr>
                        <p ><b>{`${v.creatorName} (${v.creatorAccount})`}</b> Reply at {moment(v.createdAt).format('HH:mm:ss - DD/MM/YYYY')} </p>
                        <span>{v.content}</span>
                    </div>)
                })}
            </div>
            <div className={`${this.state.readmore ? "" : "hidden"} text-center`}>
                <Button color="link" onClick={this.handleLoadmore.bind(this)}>More</Button>
            </div>
        </React.Fragment>
    }
}
export default Reply;