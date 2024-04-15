import React, { Component } from 'react';
class HTML extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (<div style={{ overflow: "auto", border: "1px solid #ccc", borderRadius: "0.25rem",borderLeft:"none", borderRight:"none" }} dangerouslySetInnerHTML={{ __html: this.props.value }}></div>
    )
  }
}

export default HTML;
