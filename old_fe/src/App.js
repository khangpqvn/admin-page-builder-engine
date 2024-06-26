import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
// Styles
// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css';
// Import Flag Icons Set
import 'flag-icon-css/css/flag-icon.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import './scss/style.css'
import "react-table/react-table.css";
import 'react-table-hoc-fixed-columns/lib/styles.css';
import 'react-image-lightbox/style.css';

import "react-datepicker/dist/react-datepicker.css";
import './index.css';
// Containers
import { DefaultLayout } from './containers';
// Pages
import Login from './views/Login/Login';

// import { renderRoutes } from 'react-router-config';
import { createBrowserHistory } from 'history';


class App extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/login" name="Login Page" component={Login} />
          <Route path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
export const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL
});

