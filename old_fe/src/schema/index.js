/* eslint no-eval: 0 */
import React, { Component } from 'react';
import helper from '../services/helper';
import Base from './Base';
class FormSchema extends Component {
    formRef = {}
    checkError() {
        for (let i = 0; i < this.props.schema.length; i++) {
            let tmpSchema = JSON.parse(JSON.stringify(this.props.schema[i]));
            if (this.props.schema[i].hideExpression && helper.checkHideExpression(this.props.schema[i].hideExpression, this.props.data)) {
                //Bị ẩn không check error
                continue;
            }
            if (tmpSchema.required || (tmpSchema.requiredExpression && helper.checkHideExpression(tmpSchema.requiredExpression, this.props.data))) {
                tmpSchema.required = true;
            }
            if (this.isInvalid(tmpSchema, this.props.data[tmpSchema.field])) {
                return { stt: i + 1, message: `Missing parameter for field '${tmpSchema.name}'` };
            }
            if (this.isInvalidRegex(tmpSchema, this.props.data[tmpSchema.field])) {
                return { stt: i + 1, message: `${tmpSchema.name} ${tmpSchema.errorOnRegexFail}` || `Data for field '${tmpSchema.name}' is invalid format!` }
            }
            if (this.props.schema[i].type === 'number') {
                if (tmpSchema.min && (+tmpSchema.min) > (+this.props.data[tmpSchema.field] || 0)) {
                    return { stt: i + 1, message: `Data for field '${tmpSchema.name}' must not lower than ${tmpSchema.min}` }
                }
                if (tmpSchema.max && (+tmpSchema.max) < (+this.props.data[tmpSchema.field] || 0)) {
                    return { stt: i + 1, message: `Data for field '${tmpSchema.name}' must not greater than ${tmpSchema.max}` }
                }
            }
            if (this.formRef[tmpSchema.field]) {
                let error = this.formRef[tmpSchema.field].checkError();
                if (error) {
                    return { stt: i + 1, message: error }
                }
            }
        }
        return { stt: 0 }
    }

    isInvalidRegex(schema, value) {
        if (schema.regex && schema.type === 'string' && value !== null && value !== undefined) {
            let str = schema.regex;
            let index = str.lastIndexOf(' ');
            if (index === -1) {
                index = str.length;
            }
            let left = str.substr(0, index), right = str.substr(index, str.length);
            let reg = new RegExp(left, right);
            if(Array.isArray(value)){
                for (let i = 0; i < value.length; i++) {
                    const ele = value[i];
                    if(!reg.test(ele)){
                        return true
                    }
                }
                return false;
            }
            return !reg.test(value);
        }
        return false;
    }


    onSubmit() {
        let error = this.checkError();
        // console.log('error', error);
        if (error.stt > 0) return helper.alert(error.message);
        if (this.props.onSubmit) {
            this.props.onSubmit();
        }
    }
    isInvalid(schema, value) {
        if (value === 0) { return false; }
        if (schema.required && !value) return true;
        if (Array.isArray(value)) {
            if (schema.required && !value.length) return true;
        }
        return false;
    }
    render() {
        if (!this.props.schema) return <p>Chưa định nghĩa schema</p>
        //convert default value
        this.props.schema.map(s => {
            if (this.props.data[s.field] === undefined && s.default) this.props.data[s.field] = s.default;
            return null;
        })
        return (<div autoComplete='off' onSubmit={evt => {
            evt.preventDefault();
            // console.log('submited')
            if (this.props.onSubmit) {
                this.props.onSubmit();
            }
        }}>
            {this.props.schema.map((comp, index) => {
                // if (comp.hideExpression ) {
                //     let str = comp.hideExpression;
                //     for (var i in this.props.data) {
                //         str = helper.replaceAll(str, i, this.props.data[i]);
                //     }
                //     console.log({ hideExpression: comp.hideExpression, str });
                //     if (window.eval(str)) return null;
                // }
                if (comp.hideExpression && helper.checkHideExpression(comp.hideExpression, this.props.data)) {
                    let dt = Object.assign({}, this.props.data);
                    if (dt[comp.field] !== undefined) {
                        delete dt[comp.field];
                        // if (this.props.onChange) {
                        //     this.props.onChange(dt);
                        // }
                    }

                    return null;
                }
                if (comp.disabledExpression && helper.checkHideExpression(comp.disabledExpression, this.props.data)) {
                    comp.disabled = true;
                }
                if (comp.requiredExpression && helper.checkHideExpression(comp.requiredExpression, this.props.data)) {
                    comp.required = true;
                }
                return <Base
                    ref={ref => { this.formRef[comp.field] = ref }}
                    key={index}
                    schema={comp}
                    mode={this.props.mode}
                    onChange={e => {
                        let dt = Object.assign({}, this.props.data);
                        dt[comp.field] = e;
                        if (this.props.onChange) {
                            this.props.onChange(dt);
                        }
                    }}
                    submitted={this.props.submitted || false}
                    value={this.props.data[comp.field]}
                    data={this.props.data}
                />
            })}
            {this.props.children}
        </div>)
    }
}

export default FormSchema;
