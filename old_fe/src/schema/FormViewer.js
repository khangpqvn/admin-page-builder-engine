import React, { Component } from 'react';
import FormSchema from './index';
import helper from '../services/helper'

import _ from 'lodash';
class FormView extends Component {
    constructor(props) {
        super(props);
        let pageInfo = helper.getPageSync(props.schema.page)
        // console.log({ props })
        this.state = {
            value: props.value || {},
            data: props.data || {},
            pageInfo,
            key: props.schema.field,
            submitted: props.submitted,
        }
        // console.log({ state: this.state })
    }
    componentWillReceiveProps(next) {
        this.setState({ value: next.value, data: next.data, submitted: next.submitted })
    }
    checkError() {
        if (this.formRef) {
            let a = this.formRef.checkError();
            if (a.message)
                return a.message;
        }
        return undefined;
    }
    render() {
        return (<React.Fragment>
            <FormSchema
                ref={ref => { this.formRef = ref; }}
                schema={this.state.pageInfo.schema}
                mode={'create'}
                data={this.state.value || {}}
                onChange={value => {
                    if (this.props.onChange) {
                        this.props.onChange(value);
                    }
                }}
                submitted={this.props.submitted || false}
            // onSubmit={this.onSubmit.bind(this)}
            >
            </FormSchema>
        </React.Fragment>)
    }
}

export default FormView;