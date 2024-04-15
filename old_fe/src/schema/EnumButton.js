import React, { Component } from 'react';
import {  Button } from 'reactstrap';
class EnumButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: props.schema,
            value: props.value
        };
        if (props.onChange) {
            props.onChange(this.state.value);
        }
    }

    componentWillReceiveProps(next) {
        if (next.value !== this.state.value) {
            this.setState({ value: next.value })
        }
    }
    render() {
        let marginRight = '0px'
        if (this.props.schema.marginRight) {
            marginRight= '5px'
        }
      let style = { width: '25%', whiteSpace: 'normal', marginRight,marginBottom:'5px'}
        if(this.props.schema.EnumButtonWidth){
            style.width=this.props.schema.EnumButtonWidth+'%'
        }

        return (
            <React.Fragment>
                {this.props.schema.items.map((item, index) =>
                    <Button
                        type='button'
                        style={style}
                        disabled={this.props.disabled}
                        key={item.key}
                        color={`${item.value == this.state.value ? 'primary' : 'secondary'}`}
                        onClick={() => {
                            let val = item.value
                            if (this.props.onChange) {
                                this.props.onChange(val);
                            }
                        }}
                    >
                        {item.key}
                        </Button>
                )
                }
            </React.Fragment>
        )
    }
}

export default EnumButton;
