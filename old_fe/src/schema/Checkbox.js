import React, { Component } from 'react';
import { AppSwitch } from '@coreui/react'
class Checkbox extends Component {
    constructor(props) {
        super(props);
        if (props.value === null || props.value === undefined) {
            if (props.onChange) {
                props.onChange(false);
            }
        }
        this.state = {
            checked: !props.value ? false : true
        };
    }
    componentWillReceiveProps(next) {
        this.setState({ checked: next.value });
    }
    render() {
        return (<div>
            <AppSwitch
                color={'primary'}
                disabled={this.props.disabled||false}
                onChange={e => {
                    if (this.props.onChange) {
                        this.props.onChange(e.target.checked);
                    }
                }}
                checked={this.props.value} />
        </div>)
    }
}

export default Checkbox;