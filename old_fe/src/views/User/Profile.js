import React, { Component } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    Label,
    Row,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import FormCtrl from '../../controls/FormCtrl';
import request from '../../services/request.js';

import { connect } from 'react-redux'
import helper from '../../services/helper';
import local from '../../services/local'
import queryString from 'qs';
class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            newPassword: '',
            verifyPassword: '',
            oldPassword: '',
            captchaId: 0,
            captchaText: '',
            captcha: null,
            account: '',
        }
        this.query = queryString.parse(this.props.location.search, { ignoreQueryPrefix: true });
    }
    componentDidMount() {
        this.loadData();
        this.loadCaptcha();
    }
    query = {};
    pageInfo = null;
    async loadCaptcha() {
        //load captcha
        let captInfo = await request.request('/api/auth/create-captcha');
        this.setState({ loading: false, captchaId: captInfo.id, captcha: captInfo.data, captchaText: '' })
    }
    async loadData() {
        let pageInfo = await helper.getPage(this.query.page);
        // let rs = await helper.callPageApi(pageInfo, pageInfo.read, {});
        let account = local.get('auth').key;

        this.setState({ pageInfo, account })

    }
    async save() {
        await helper.callPageApi(this.state.pageInfo, 'update', this.state.data);
        helper.alert('Success');
    }
    async changePassword() {
        if (!this.state.newPassword || !this.state.verifyPassword || !this.state.oldPassword || !this.state.captchaText) return helper.alert("Missing required parameter!");
        if (this.state.newPassword !== this.state.verifyPassword) return helper.alert("Confirm password not match!");
        try {
            let rs = await helper.callPageApi(this.state.pageInfo, 'change-password', {
                account: this.state.account,
                oldPassword: this.state.oldPassword,
                newPassword: this.state.newPassword,
                confirmPassword: this.state.verifyPassword,
                captcha: this.state.captchaId + '|' + this.state.captchaText,
                type: 'up'
            });
            helper.alert(rs.message);
        } catch (err) {
            helper.alert(err.message || '');
        }
        this.loadCaptcha();
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    toggleFade() {
        this.setState((prevState) => { return { fadeIn: !prevState } });
    }

    onBackClick() {
        this.props.history.goBack();
    }

    render() {
        let user = local.get('user');
        let query = { page: this.query.page, mode: 'edit', id: user.id };
        // console.log({ query })
        // if (!this.state.data) return (<Loader />);

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="6" sm="6" md="6">
                        <form>
                            <Card>
                                <CardHeader>
                                    <Button color="default" type='button' onClick={this.onBackClick.bind(this)} className='btn-brand'><i className="fa fa-close"></i><span>Close</span></Button>
                                    {/* <Button onClick={this.save.bind(this)} color="primary" type='button' className='pull-right btn-brand'><i className="fa fa-check"></i><span>Lưu thông tin</span></Button> */}
                                </CardHeader>
                                <CardBody>
                                    <FormCtrl query={query} />
                                    {/* <FormSchema
                                        schema={this.state.pageInfo.schema}
                                        data={this.state.data || {}}
                                        onChange={data => {
                                            this.setState({ data })
                                        }}
                                        onSubmit={this.save.bind(this)}>
                                        {this.state.pageInfo.buttons.map((item, index) => {
                                            if (this.state.mode === item.mode) {
                                                return <Button key={index} color={item.color} type={item.type} onClick={() => { if (item.type === 'button') this.onButtonClick(item) }}><i className={item.icon} /> {item.title}</Button>
                                            }
                                            return null;
                                        })}
                                    </FormSchema> */}

                                </CardBody>
                                {/* <CardFooter>
                                    
                                </CardFooter> */}
                            </Card>
                        </form>
                    </Col>

                    <Col xs="6" sm="6" md="6">
                        <form>
                            <Card>
                                <CardBody>
                                    <FormGroup row>
                                        <Col md='3'>
                                            <Label htmlFor="name">Account*</Label>
                                        </Col>
                                        <Col md='9'>
                                            <Input type="text" id="account" placeholder="Account" required disabled={true} defaultValue={this.state.account} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col md='3'>
                                            <Label htmlFor="name">Old password*</Label>
                                        </Col>
                                        <Col md='9'>
                                            <Input type="password" id="password1" placeholder="Old password" required defaultValue={this.state.oldPassword} onChange={evt => this.setState({ oldPassword: evt.target.value })} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col md='3'>
                                            <Label htmlFor="name">New password*</Label>
                                        </Col>
                                        <Col md='9'>
                                            <Input type="password" id="password2" placeholder="New password" required defaultValue={this.state.newPassword} onChange={evt => this.setState({ newPassword: evt.target.value })} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col md='3'>
                                            <Label htmlFor="name">Re-type password*</Label>
                                        </Col>
                                        <Col md='9'>
                                            <Input type="password" id="verifyPassword" placeholder="Re-type new password" required defaultValue={this.state.verifyPassword} onChange={evt => this.setState({ verifyPassword: evt.target.value })} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col md='3'>
                                            <Label htmlFor="name">Captcha*</Label>
                                        </Col>
                                        <Col md={4}>
                                            <div className='captcha' dangerouslySetInnerHTML={{ __html: this.state.captcha }}></div>
                                        </Col>
                                        <Col md={5}>
                                            <InputGroup className="mb-4">
                                                <InputGroupAddon addonType="prepend">
                                                    <Input type="text" maxLength="4" placeholder="Input Captcha" bsSize='lg' value={this.state.captchaText} onChange={evt => this.setState({ captchaText: evt.target.value })} />
                                                    <InputGroupAddon addonType="prepend">
                                                        <Button color='light' type='button' onClick={() => {
                                                            this.loadCaptcha();
                                                        }}><i className='fa fa-refresh' /></Button>
                                                    </InputGroupAddon>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Col>
                                    </FormGroup>
                                    <Button onClick={this.changePassword.bind(this)} color="primary" type='button' className='pull-right btn-brand'><i className="fa fa-check"></i><span>Change password</span></Button>
                                </CardBody>
                            </Card>
                        </form>
                    </Col>
                </Row>

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { userInfo: state.userInfo }
}
export default connect(mapStateToProps)(Profile);