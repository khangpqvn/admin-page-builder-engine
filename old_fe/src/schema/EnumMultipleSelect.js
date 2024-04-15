import React, { Component } from 'react';
import { Input, Button, FormGroup } from 'reactstrap';
import _ from 'lodash';
class EnumSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: props.schema,
            value: props.value || []
        };
        // console.log({ val: this.state.value })
        if (props.onChange) {
            props.onChange(this.state.value);
        }
    }

    componentWillReceiveProps(next) {
        // console.log({ 'next.value':next.value })
        if (_.difference(next.value || [], this.state.value).length) {
            this.setState({ value: next.value || [] })
        }
    }
    render() {
        let marginRight = '0px'
        if (this.props.schema.marginRight) {
            marginRight = '5px'
        }
        let style = { width: '25%', marginRight, marginBottom: '5px' }
        if (this.props.schema.EnumButtonWidth) {
            style.width = this.props.schema.EnumButtonWidth + '%'
        }

        return (
            <FormGroup >
                {this.props.schema.items.map((item, index) => {
                    let checked = false;
                    this.state.value.map(v => {
                        if (v == item.value) {
                            checked = true
                        }
                    });

                    return <Button
                        type='button'
                        style={style}
                        disabled={this.props.disabled}
                        key={item.key}
                        color={`${checked ? 'primary' : 'secondary'}`}
                        onClick={() => {

                            checked = !checked
                            if (checked) {
                                this.state.value.push(item.value)
                            } else {
                                _.remove(this.state.value, (a) => {
                                    return a == item.value
                                })
                            }
                            if (this.props.onChange) {
                                this.props.onChange(this.state.value);
                            }
                        }}
                    >
                        <Input type="checkbox" disabled={true} checked={checked}></Input>
                        {item.key}
                    </Button>
                }
                )
                }
            </FormGroup>
        )
    }
}

export default EnumSelect;