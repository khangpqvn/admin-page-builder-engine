import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        {/* <span>FPT DPS!</span> */}
        <span><a href="https://facebook.com/ongbantat.store" target='_blank'>Powered by: Ông bán tất &copy;2023</a></span>
        {/* <span className="ml-auto">Powered by <a href="https://coreui.io/react">CoreUI for React</a></span> */}
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
