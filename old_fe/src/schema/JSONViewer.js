import React, { Component } from 'react';
import JSONInput from 'react-json-editor-ajrm/index';
class JSONWidget extends Component {
    constructor(props) {
        super(props);
        // if (props.value === null || props.value === undefined) {
        //     if (props.onChange) {
        //         props.onChange(false);
        //     }
        // }
        // this.state = {
        //     checked: !props.value ? false : true
        // };
    }
    // onChange(val) {
    //     this.setState({ checked: val });
    //     if (this.props.onChange) {
    //         this.props.onChange(val);
    //     }
    // }
    // componentWillReceiveProps(next) {
    //     this.setState({ checked: next.value });
    // }
    render() {
        let placeholder = this.props.value || {};
        try {
            placeholder = JSON.parse(this.props.value);
        } catch (err) {
        }
     
        return (<JSONInput
            theme={'dark_vscode_tribute'}
            width={'100%'}
            height={this.props.height || '250px'}
            placeholder={placeholder || {}}
            viewOnly={this.props.disabled}
            onChange={e => {
                if (e.error) return;
                if (this.props.onChange) {
                    try {
                        this.props.onChange(JSON.parse(e.jsObject))
                    } catch (error) {
                        this.props.onChange(e.jsObject)
                    }
                }
            }}
        />)
    }
}

export default JSONWidget;