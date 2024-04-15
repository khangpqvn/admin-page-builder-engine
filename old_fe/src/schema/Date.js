import React, { Component } from 'react';
import DatePickerComponent from "react-datepicker";
import moment from 'moment';
class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: props.schema,
            value: props.value ? moment(props.value).toDate() : new Date(),
            focus: false
        };
    }
    onChange(val) {
        this.setState({ value: val });
        if (this.props.onChange) {
            if (val) {
                this.props.onChange(val.valueOf());
            } else {
                this.props.onChange(val);
            }

        }
    }
    componentWillReceiveProps(next) {
        if (next.value !== moment(this.state.value).valueOf()) {
            this.setState({ value: next.value ? moment(next.value).toDate() : new Date() });
        }
    }
    render() {
        return (<div>
            <DatePickerComponent
                selected={this.props.value ? moment(this.props.value).toDate() : null}
                onChange={e => {
                    this.onChange(e);
                }}
                showTimeSelect
                timeFormat="HH:mm"
                className="form-control full-width"
                dateFormat='dd/MM/yyyy HH:mm'
                // disabled={this.state.schema.disabled || false}
                placeholderText={this.props.schema.placeholder || "DD/MM/YYYY HH:mm"}
                disabled={this.props.disabled}
            />
        </div>)
    }
}

export default DatePicker;