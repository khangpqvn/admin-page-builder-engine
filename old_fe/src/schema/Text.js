import React, { Component } from 'react';
import { Input } from 'reactstrap';
import NumberFormat from 'react-number-format';
import helper from '../services/helper';

class Text extends Component {
    firstLoad = true;
    render() {
        let type = '';
        switch (this.props.schema.type) {
            case 'number': type = 'number'; break;
            default: type = 'text';
        }
        if (this.props.schema.hideValue) type = 'password';
        let value = type === 'number' ? this.props.value : (this.props.value || '');
        if (value === null || value === undefined) {
            value = '';
        }
        if (this.props.onChange && this.firstLoad) {
            this.props.onChange(value);
            this.firstLoad = false
        }

        if (type === 'number') {

            return <React.Fragment>
                <NumberFormat
                    value={value}
                    customInput={Input}
                    thousandSeparator={true}
                    disabled={this.props.disabled || false}
                    invalid={!!this.props.invalid || false}
                    onValueChange={(values) => {
                        // const { formattedValue, value } = values;
                        if (this.props.onChange) {
                            this.props.onChange(values.value);
                        }
                    }}
                    placeholder={this.props.schema.placeholder || 'Input number'}
                />
                {
                    (this.props.schema || { enableReadNumber: false }).enableReadNumber ?
                        <div className="">{helper.convertNumberToText(value)}</div>
                        : null
                }
            </React.Fragment>


        }

        return <Input
            type={type}
            invalid={!!this.props.invalid || false}
            disabled={this.props.disabled || false}
            placeholder={this.props.schema.placeholder || ''}
            min={type === 'number' && this.props.schema.min ? Number(this.props.schema.min) : undefined}
            max={type === 'number' && this.props.schema.max ? Number(this.props.schema.max) : undefined}
            value={value}
            onChange={evt => {
                if (this.props.onChange) {
                    this.props.onChange(evt.target.value);
                }
            }} />
    }
}

export default Text;