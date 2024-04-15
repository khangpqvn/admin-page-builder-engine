import React, { Component } from 'react';
import { Input } from 'reactstrap';
class TextArea extends Component {
    render() {
        return <Input
            rows={(+this.props.schema.numberOfLine) || 5}
            type='textarea'
            invalid={!!this.props.invalid || false}
            placeholder={this.props.schema.placeholder || ''}
            disabled={this.props.disabled}
            value={this.props.value || ''}
            onChange={evt => {
                if (this.props.onChange) {
                    this.props.onChange(evt.target.value);
                }
            }} />
    }
}

export default TextArea;