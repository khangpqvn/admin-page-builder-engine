import React, { Component } from 'react';
import { Input, InputGroupAddon, Button, InputGroup, Col, Row } from 'reactstrap';
import request from '../services/request.js';
class Captcha extends Component {
    constructor(props) {
        super(props);
        this.state = {
            captchaText: '',
            captchaId: '',
            captcha: null
        }
        this.loadCaptcha();
    }
    async loadCaptcha() {
        let captInfo = await request.request('/api/auth/create-captcha');
        this.setState({ loading: false, captchaId: captInfo.id, captcha: captInfo.data,captchaText:'' });
        this.onChange(this.state.captchaId, this.state.captchaText);
    }
    componentWillReceiveProps(next) {
        if(next.submitted){
            this.loadCaptcha();
        }
    }
    onChange(id, text) {
        let rs = null;
        if (id && text) {
            rs = `${id}|${text}`
        }
        if (this.props.onChange) {
            this.props.onChange(rs)
        }
    }
    render() {
        if (!this.state.captcha) return <p>Loading...</p>
        return <Row>
            <Col xs={12}>
                <div className='captcha' dangerouslySetInnerHTML={{ __html: this.state.captcha }}></div>
                <div className='captcha' >
                    <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                            <Input type="text" maxLength="4" className='captcha-input' placeholder="input" value={this.state.captchaText} onChange={evt => {
                                this.setState({ captchaText: evt.target.value });
                                this.onChange(this.state.captchaId, evt.target.value);
                            }} />
                            <InputGroupAddon addonType="prepend">
                                <Button color='light' type='button' onClick={() => {
                                    this.loadCaptcha();
                                }}><i className='fa fa-refresh' /></Button>
                            </InputGroupAddon>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Col>
        </Row>

    }
}

export default Captcha;