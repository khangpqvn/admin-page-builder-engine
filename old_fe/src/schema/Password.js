import React, { Component } from 'react';
import { Input } from 'reactstrap';
class Password extends Component {
    render() {
        return <Input
            type='password'
            disabled={this.props.disabled}
            invalid={!!this.props.invalid || false}
            placeholder={this.props.schema.placeholder||''}
            autoComplete='off'
            value={this.props.value||''}
            onChange={evt => {
                if (this.props.onChange) {
                    this.props.onChange(evt.target.value);
                }
            }} />
    }
}

export default Password;