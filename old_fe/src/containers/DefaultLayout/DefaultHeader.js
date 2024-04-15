import React, { Component } from 'react';
import { Badge, Button, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, Modal, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux'
import { AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
// import logo from '/assets/img/logo.png'
// import sygnet from '../../assets/img/brand/sygnet.svg'
import local from '../../services/local';
import request from '../../services/request';
import helper from '../../services/helper';
import Loader from '../../controls/Loader';
import ListCtrl from '../../controls/ListCtrl';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import gravatarUrl from 'gravatar-url';
import Gravatar from 'react-gravatar'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unread: 0,
      isShowModal: false,
      modalQuery: { page: 23 },
      money: -1
    }
  }
  async loadData() {
    if (local.get('isPublic')) { return; }
    let pageInfo = await helper.getPage(23);
    let rs = await helper.callPageApi(pageInfo, 'count', {})
    this.setState({ unread: rs.count });
    // console.log({rs})
  }

  connectSocket() {
    request.ioRequest('/api/socket/init', {}, { 'api-version': 'common' }, 'post').then((data) => {
      request.socket.removeAllListeners();
      request.socket.on('disconnect', function () {
        request.socket._raw.io._reconnection = true;
        request.socket._raw.io._reconnectionAttempts = Infinity;
      });
      request.socket.on('connect', () => {
        this.connectSocket();
      });
      request.socket.on('message', (data) => {
        toast.success(data.subject, {
          position: toast.POSITION.BOTTOM_LEFT
        });

        if (data.payload && data.payload.action === "UPDATE_MONEY_USER") {
          this.setState({ money: data.payload.money });
        }
        this.loadData()
      });
    }).catch(err => console.log(err))
  }
  componentDidMount() {

    this.connectSocket();
    this.loadData();
  }

  componentWillUnmount() {
    request.socket.removeAllListeners();
  }

  async onLogoutClick() {
    await request.request('/api/auth/logout?page=16&api=logout', {}, {}, 'POST');
    local.clear();
    window.location.href = '';
  }
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    // const imgGravatar = gravatarUrl(currentLogin.email, { size: 200 });
    const user = local.get('user');
    return (
      <React.Fragment>

        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: 'assets/img/logo_invert.png', height: 40, alt: ' Logo' }}
          minimized={{ src: 'assets/img/logo.png', width: 30, height: 30, alt: ' Logo' }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        {/* <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink href="/">Dashboard</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#/users">Users</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#">Settings</NavLink>
          </NavItem>
        </Nav> */}
        {local.get('isPublic') ? <Nav className="ml-auto" navbar></Nav> :
          <Nav className="ml-auto" navbar>
            <AppHeaderDropdown direction="down">
              <DropdownToggle nav onClick={() => { this.setState({ isShowModal: true }) }}>
                {this.state.isShowModal ? <i className="fa fa-bell"></i> : <i className="icon-bell"></i>}
                {this.state.unread ? <Badge pill color="danger">{this.state.unread || 0}</Badge> : null}
              </DropdownToggle>
              {/* <DropdownMenu right style={{ right: 'auto' }}>
              <DropdownItem header tag="div" className="text-center"><strong>Bạn có {this.state.unread || 0} thông báo chưa đọc</strong></DropdownItem>

              <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
              <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>
              <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
              <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem>
            </DropdownMenu> */}
            </AppHeaderDropdown>
            {/*  <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-list"></i></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-location-pin"></i></NavLink>
          </NavItem> */}
            <AppHeaderDropdown direction="down">
              <DropdownToggle nav>
                {/* {local.get('isPublic')?null:<p className='mr-3 mt-3'>Login as: {currentLogin.name}</p>} */}
                Số dư: <b>{(this.state.money >= 0 ? this.state.money : user.money).toLocaleString()}₫</b>
                <Gravatar email={user.email} size={40} className="img-avatar" />

                {/* <img src={
                  imgGravatar
                  // this.props.userInfo.avatar
                } className="img-avatar" alt={currentLogin.name} /> */}
              </DropdownToggle>
              <DropdownMenu right style={{ right: 'auto' }}>
                {/* <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
              <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
              <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem> */}
                <DropdownItem>
                  <Link to='/profile?page=16'>
                    <i className="fa fa-user"></i> Thông tin người dùng
                  </Link>

                </DropdownItem>
                {/* <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
              <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem> */}
                <DropdownItem onClick={this.onLogoutClick.bind(this)}><i className="fa fa-lock"></i> Đăng xuất</DropdownItem>
              </DropdownMenu>
            </AppHeaderDropdown>
          </Nav>}
        {/* <AppAsideToggler className="d-md-down-none" /> */}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}

        <Modal
          isOpen={this.state.isShowModal}
          fade={false}
          size={'lg'}
          backdrop={false}
          toggle={() => {
            this.setState({ isShowModal: false })
          }}>
          <ModalBody>
            {this.state.isShowModal ? <ListCtrl query={this.state.modalQuery} /> : <Loader />}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                this.setState({ isShowModal: false })
                this.loadData();
              }}>Close</Button>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

// export default DefaultHeader;
const mapStateToProps = (state) => {
  return { userInfo: state.userInfo, ui: state.ui }
}
export default connect(mapStateToProps)(DefaultHeader);
