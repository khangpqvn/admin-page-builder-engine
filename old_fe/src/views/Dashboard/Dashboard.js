import React, { Component } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import helper from '../../services/helper';
import ReactTable from "react-table";
import ListCtrl from '../../controls/ListCtrl';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  componentDidMount() {
    // this.init();
  }
  async init() {
    return;

  }

  render() {
    return (<div className="animated fadeIn">
      {/* <Card>
        <CardHeader>
          <h3>Chào mừng bạn đến với <i >Ông bán tất</i></h3>
        </CardHeader>
      </Card> */}
      {/* <marquee behavior="scroll" direction="left"><h3>Chào mừng bạn đến với <i >Ông bán tất</i></h3></marquee> */}
      <ListCtrl query={{ page: 56 }} />
    </div>);
  }
}

export default Dashboard;
