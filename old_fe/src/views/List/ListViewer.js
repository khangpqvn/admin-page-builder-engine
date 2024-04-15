import React, { Component } from 'react';


import queryString from 'qs';
import ListCtrl from '../../controls/ListCtrl';
class ListViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: queryString.parse(props.location.search, { ignoreQueryPrefix: true }),
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ query: queryString.parse(next.location.search, { ignoreQueryPrefix: true }) });
        // this.init();
    }
    render() {
        return <ListCtrl query={this.state.query} />
    }
}

export default ListViewer;
