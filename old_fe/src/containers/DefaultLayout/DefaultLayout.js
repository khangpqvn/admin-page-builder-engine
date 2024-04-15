import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import { connect } from "react-redux";
import {
  AppAside,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
  AppFooter
} from "@coreui/react";
// sidebar nav config
// import navigation from '../../_nav';
// routes config
import routes from "../../routes";
import DefaultAside from "./DefaultAside";
import DefaultHeader from "./DefaultHeader";
import DefaultFooter from "./DefaultFooter";
import local from "../../services/local";
import helper from "../../services/helper";
import Loader from "../../controls/Loader";
import request from "../../services/request";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import _ from "lodash";
import queryString from "qs";
class DefaultLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      nav: [],
    };
  }
  nav = [];

  async componentDidMount() {
    try {
      let { usingPublicSession, expired } = queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true,
      });
      if (expired) {
        local.clear();
      }
      await helper.loadFeConf();
      if (!local.get("session")) {
        if (usingPublicSession) {
          let session = helper.getConf("PUBLIC_USER_TOKEN");
          local.set("session", session);
          local.set("isPublic", "1");
        } else {
          return this.props.history.replace("/login");
        }
      }

      try {
        let rs = await request.request(
          "/api/auth/sign-in/refresh-token?page=16&api=refresh-token"
        );
        local.set("session", rs.token);
        local.set("user", JSON.stringify(rs.user));
        local.set("auth", JSON.stringify(rs.auth));
      } catch (err) {
        local.clear();
        this.props.history.replace("/login");
        return helper.alert(err.message);
      }
      //load meta data
      let meta = await request.request("/api/admin/get-meta");
      meta.pages.map((page) => {
        if (!Array.isArray(page.buttons)) page.buttons = [];
        for (var i in page.schema) {
          page.schema[i].pageId = page.id;
        }
        return null;
      });
      local.set("meta", JSON.stringify(meta));
      let userInfo = local.get("user");
      let nav = this.calculateNav(meta.menus, userInfo.roleId);
      this.setState({ loading: false, nav });
    } catch (err) {
      local.clear();
      this.props.history.replace("/login");
    }
  }
  calculateNav(allMenus, role) {
    let menus = [];
    allMenus.map((m) => {
      m.isOpen = false;
      if (!m.roles) {
        return; // menus.push(m);
      }
      if (m.roles.length === 0) {
        return; // menus.push(m);
      }
      if (!(m.roles && m.roles.length > 0)) return;
      if (_.intersection(m.roles, role).length > 0) {
        return menus.push(m);
      }
      return null;
    });
    let items = [];
    menus.map((m) => {
      if (m.isParent) {
        m.isOpen = false;
        if (!m.url) m.url = "url";
        items.push(m);
      }
      return null;
    });
    menus.map((m) => {
      if (m.isParent) return null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id == m.parent) {
          if (!items[i].children) items[i].children = [];
          items[i].children.push(m);
        }
      }
      return null;
    });
    return { items };
  }
  render() {
    if (this.state.loading) return <Loader />;
    return (
      <div className="app">
        <AppHeader fixed>
          <DefaultHeader />
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <AppSidebarNav
              navConfig={this.state.nav}
              location={this.props.location}
            />
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            {/* <AppBreadcrumb appRoutes={routes} /> */}
            <Container fluid className="mt-4">
              <marquee behavior="scroll" direction="left">
                <h6 style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: helper.getConf("ANNOUNCEMENTS") || "Chào mừng các bạn đến với <i><b>Ông Bán Tất</b></i>" }}>
                </h6>
              </marquee>
              <Switch>
                {routes.map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={(props) => <route.component {...props} />}
                    />
                  ) : null;
                })}
                <Redirect from="/" to="/login" />
              </Switch>
            </Container>
          </main>
          <AppAside fixed hidden>
            <DefaultAside />
          </AppAside>
        </div>
        <AppFooter>
          <DefaultFooter />
        </AppFooter>
        <ToastContainer />
      </div>
    );
  }
}

// export default DefaultLayout;
const mapStateToProps = (state) => {
  return { userInfo: state.userInfo };
};
export default connect(mapStateToProps)(DefaultLayout);
