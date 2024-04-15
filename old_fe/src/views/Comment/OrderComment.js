import _ from 'lodash';
import moment from 'moment';
import queryString from 'qs';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from 'reactstrap';
import FormCtrl from '../../controls/FormCtrl';
import Loader from '../../controls/Loader';
import Helper from '../../services/helper';
import request from '../../services/request';
import Reply from './Reply';
import LoadingOverlay from 'react-loading-overlay';

class OrderComment extends Component {
    query = {};
    //test: http://127.0.0.1:3000/#/ordercomment?orderid=1&page=36
    constructor(props) {
        super(props);
        let query = queryString.parse(props.location.search, { ignoreQueryPrefix: true });
        this.query = _.cloneDeep(query)
        this.state = {
            listComment: null,
            attachmentFileComment: null,
            orderId: query.orderId,
            commentBody: '',
            skip: 0,
            limit: 11,
            readmore: false,
            loading: true,
            commentLoading: false
        }
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.addComment = this.addComment.bind(this);
    }
    componentDidMount() {
        this.loadDataCm();
    }
    async loadDataCm() {

        let url = `/api/comment/order/find?skip=${this.state.skip}&limit=${this.state.limit}&orderId=${this.state.orderId}`;
        let rs = await request.request(url, {}, { 'api-version': 'common' }, 'GET');
        this.state.loading = false;
        if (rs.data.length > this.state.limit - 1) {
            rs.data.pop();
            this.state.readmore = true;
        } else {
            this.state.readmore = false;
        }
        this.state.listComment = (this.state.listComment || []).concat(rs.data);
        this.setState(this.state);
    }

    readmoreComment() {
        this.state.skip = (this.state.listComment || []).length;
        this.loadDataCm();
    }

    handleOnChangeTextare(event) {
        this.state.commentBody = event.target.value;
        this.setState(this.state);
    }

    onChangeHandler = event => {

        this.state.attachmentFileComment = event.target.files[0];
        this.setState(this.state);
    }

    async downloadAttachment(id, filename) {
        let response = await request.download('/api/file/download-file?fileId=' + id);
        response.blob().then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        });
    }

    async addComment() {
        try {
            if (!this.state.commentBody) {
                return;
            }
            let formData = { orderId: this.state.orderId, content: this.state.commentBody }
            if (this.state.attachmentFileComment != null) {
                let formUpload = new FormData();
                formUpload.append('files', this.state.attachmentFileComment);
                this.setState({ commentLoading: true })
                let fileReponse = await request.upload('/api/file/upload-file', formUpload);
                this.setState({ commentLoading: false })
                formData.attachment = fileReponse.created[0].id;
            }
            let rs = await request.request(`/api/comment/order/add`, formData, { 'api-version': 'common' }, "POST");
            // toast.success("Success", {
            //     position: toast.POSITION.BOTTOM_LEFT
            // });
            this.fileInput.value = "";
            this.state.listComment = [rs].concat(this.state.listComment);
            this.state.skip += 1;
            this.state.attachmentFileComment = null;
            this.state.commentBody = '';
            this.setState(this.state)

        } catch (error) {
            if (this.state.commentLoading) {
                this.setState({ commentLoading: false })
            }
            Helper.alert(error.message ||'Oops, Something went wrong!');
        }
    }
    onChange(data) {
        this.setState(data)
    }

    render() {
        if (this.state.loading) return <Loader />
        let query = { page: this.query.page, mode: 'edit', id: this.query.orderId, embed: "{\"showCaptcha\":false,\"mode\":\"view\"}" };

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col md="7" xs="7">
                        <FormCtrl query={query} />
                    </Col>
                    <Col md="5" xs="5">
                        <Card>
                            <CardHeader><h5>Comment</h5></CardHeader>
                            <LoadingOverlay
                                active={this.state.commentLoading}
                                spinner
                                text='Loading...'
                            >
                                <CardBody>
                                    <FormGroup row>
                                        <Col md='12'>
                                            <Input type="textarea" rows="5" value={this.state.commentBody}
                                                onChange={(event) => this.handleOnChangeTextare(event)} />
                                        </Col>
                                    </FormGroup>
                                    Attachment <input type="file" name="file" onChange={this.onChangeHandler} ref={ref => this.fileInput = ref} />
                                    <Button disabled={!this.state.commentBody} onClick={this.addComment.bind(this)} color="primary" type='button' className='pull-right btn-brand buttonReply'><span>Add Comment</span></Button>
                                </CardBody>
                            </LoadingOverlay>
                            <hr />
                            {this.state.listComment && this.state.listComment.length ?
                                <CardBody style={{ overflow: "scroll", maxHeight: "1000px" }}>
                                    {this.state.loading ? <Loader /> :
                                        <React.Fragment>
                                            {(this.state.listComment || []).map((v, i) => {
                                                return (
                                                    <Card key={'comment-' + v.id}>
                                                        <CardHeader>
                                                            <b>{`${v.creatorName} (${v.creatorAccount})`}</b> Posted at {moment(v.createdAt).format('HH:mm:ss - DD/MM/YYYY')}
                                                        </CardHeader>
                                                        <CardBody>
                                                            <pre>{v.content}</pre>

                                                            {v.attachment ?
                                                                <React.Fragment>
                                                                    <hr />
                                                                    <Row>
                                                                        <Col xs="12" md="12">
                                                                            <Button onClick={() => this.downloadAttachment(v.attachment.id, v.attachment.fileName)} >
                                                                                <img src='assets/img/download.png' alt='avatar' className="iconRepply" />
                                                                                <span data-toggle="tooltip" title={v.attachment.fileName}>{v.attachment.fileName.length > 30 ? v.attachment.fileName.substring(0, 15) + '...' + v.attachment.fileName.substring(v.attachment.fileName.length - 15) : v.attachment.fileName}</span>
                                                                            </Button>
                                                                        </Col>
                                                                    </Row>
                                                                </React.Fragment>
                                                                : null
                                                            }
                                                            <Reply listComment={this.state.listComment} orderId={this.state.orderId} commentId={v.id} listReply={v.reply} onChange={this.onChange.bind(this)} />
                                                        </CardBody>

                                                    </Card>
                                                )
                                            }
                                            )}
                                            < div className={`${this.state.readmore ? '' : 'hidden'} `}>
                                                <Button color="link" onClick={() => this.readmoreComment()} className='pull-right btn-brand buttonReply'><span>More</span></Button>
                                            </div>
                                        </React.Fragment>
                                    }
                                </CardBody>
                                : null}</Card>
                    </Col>
                </Row>




            </div >
        );
    }

}


export default OrderComment;