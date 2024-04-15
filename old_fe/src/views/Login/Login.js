import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";
import request from "../../services/request.js";
import local from "../../services/local.js";
import helper from "../../services/helper";
import Loader from "../../controls/Loader";
// import AccountKit from 'react-facebook-account-kit';
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: true,
      captchaId: 0,
      captchaText: "",
      captcha: null,
    };
  }
  async componentDidMount() {
    if(local.get('isPublic')){
      local.clear()
      sessionStorage.clear()
    }
    await helper.loadFeConf();

    let success = await helper.refreshToken();
    this.setState({ loading: false });
    if (success) {
      return this.props.history.push(`/dashboard`);
    }
    let unauthorized = sessionStorage.getItem("unauthorized");
    if (unauthorized) {
      // helper.alert("Unauthorized");
      sessionStorage.removeItem("unauthorized");
    }
    sessionStorage.setItem("aftersignin", 0);
    this.loadCaptcha();
  }
  async loadCaptcha() {
    //load captcha
    let captInfo = await request.request("/api/auth/create-captcha");
    this.setState({
      loading: false,
      captchaId: captInfo.id,
      captcha: captInfo.data,
      captchaText: "",
    });
  }

  async onRegisterClick(e){
    console.log('REGISTER CLICK')
    let session = helper.getConf('PUBLIC_USER_TOKEN')
    let registerLink = helper.getConf('REGISTER_LINK')
    // await helper.refreshToken();
    setTimeout(() => {
      local.set('session',session)
      local.set('isPublic','1')
      console.log({session,registerLink})
      window.location.href = registerLink
    }, 30);

  }

  async onForgotPasswordClick(e){
    console.log('FORGOT PASS CLICK')
    let session = helper.getConf('PUBLIC_USER_TOKEN')
    let link = helper.getConf('FORGOT_PASSWORD_LINK')
    // await helper.refreshToken();
    setTimeout(() => {
      local.set('session',session)
      local.set('isPublic','1')
      window.location.href = link
    }, 30);
  }

  async onLoginClick(e) {
    e.preventDefault();
    try {
      if (!this.state.username || !this.state.password) {
        return helper.alert("Filling login infomation, please");
      }
      let refreshSuccess = await helper.refreshToken();
      if (refreshSuccess) {
        let t = await helper.confirm(
          "Session existed. Try to refresh the browser window!"
        );
        if (t) {
          window.location.reload();
        }
        return;
      }
      let rs = await request.request(
        "/api/auth/sign-in/account",
        {
          account: this.state.username,
          password: this.state.password,
          captcha: this.state.captchaId + "|" + this.state.captchaText,
        },
        { "api-version": "public" }
      );
      local.set("session", rs.token);
      local.set("user", JSON.stringify(rs.user));
      local.set("auth", JSON.stringify(rs.auth));
      sessionStorage.setItem("aftersignin", 1);
      let lastLocation = sessionStorage.getItem("lastLocation");
      if (lastLocation) {
        window.location.href = lastLocation;
        sessionStorage.removeItem("lastLocation");
      } else {
        this.props.history.push(`/dashboard`);
      }
    } catch (err) {
      this.loadCaptcha();
      helper.alert(err.message);
    }
    // return false;
  }
  // async handleAccountKitResponse(result) {
  //   console.log('on token', result);
  //   this.setState({ accountKitToken: result.code });
  // }
  render() {
    if (this.state.loading) return <Loader />;
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Row>
                      <Col md={6}>
                        <h2>Login</h2>
                        <p className="text-muted">Login for doing something</p>
                      </Col>
                      <Col md={6}>
                        <img
                          src="assets/img/logo.png"
                          className="login-logo"
                          alt="avatar"
                        />
                      </Col>
                    </Row>
                    <form
                      onSubmit={this.onLoginClick.bind(this)}
                      autoComplete="off"
                    >
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="text"
                          placeholder="Account"
                          value={this.state.username}
                          onChange={(evt) =>
                            this.setState({ username: evt.target.value })
                          }
                        />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="password"
                          placeholder="Password"
                          value={this.state.password}
                          autoComplete="off"
                          onChange={(evt) =>
                            this.setState({ password: evt.target.value })
                          }
                        />
                      </InputGroup>
                      <Row className="mb-4">
                        <Col md={6}>
                          <div
                            className="captcha"
                            dangerouslySetInnerHTML={{
                              __html: this.state.captcha,
                            }}
                          ></div>
                        </Col>
                        <Col md={6}>
                          <InputGroup className="mb-4">
                            <InputGroupAddon addonType="prepend">
                              <Input
                                type="text"
                                maxLength="4"
                                placeholder="Captcha"
                                bsSize="lg"
                                value={this.state.captchaText}
                                onChange={(evt) =>
                                  this.setState({
                                    captchaText: evt.target.value,
                                  })
                                }
                              />
                              <InputGroupAddon addonType="prepend">
                                <Button
                                  color="light"
                                  type="button"
                                  onClick={() => {
                                    this.loadCaptcha();
                                  }}
                                >
                                  <i className="fa fa-refresh" />
                                </Button>
                              </InputGroupAddon>
                            </InputGroupAddon>
                          </InputGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="12">
                          <Button color="primary" type="submit" block>
                            Đăng nhập
                          </Button>
                        </Col>
                        <Col xs="6" className="text-left">
                          <Button
                            color="link"
                            className="px-0"
                            type="button"
                            block
                            onClick={
                              this.onRegisterClick.bind(this)
                            }
                          >
                            Đăng ký
                          </Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button
                            color="link"
                            className="px-0"
                            type="button"
                            block
                            onClick={
                              this.onForgotPasswordClick.bind(this)
                            }
                          >
                            Quên mật khẩu?
                          </Button>
                        </Col>
                      </Row>
                    </form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
