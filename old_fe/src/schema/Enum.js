import React, { Component } from 'react';
import { Input } from 'reactstrap';
class Enum extends Component {
    render() {
        return (<Input
            type='select'
            value={this.props.value||''}
            disabled={this.props.disabled}
            onChange={evt => {
                let val = evt.target.value;
                if (val === '') val = null;
                if (this.props.onChange) {
                    this.props.onChange(val);
                }
            }}>
            <option value=''>none</option>
            {this.props.schema.items.map((item, index) =>
                <option value={item.value} key={index}>{item.key}</option>)}
        </Input>)
    }
}

export default Enum;