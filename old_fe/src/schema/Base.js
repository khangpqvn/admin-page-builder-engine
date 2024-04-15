import React, { Component } from 'react';
import Widgets from './Widgets';
import { FormGroup, Label, Col } from 'reactstrap'
class Base extends Component {
    firsLoad = true;
    checkError() {
        if (this.formRef)
            return this.formRef.checkError();
        return undefined;
    }
    error() {
        let rs = this.isInvalid()
        if (rs) {
            return <p className='text-danger'><b>{this.props.schema.name} {rs}!</b></p>
        }
    }

    isInvalid() {
        if ((this.firsLoad === false || this.props.mode === 'edit') && this.props.schema.required && (this.props.value === null || this.props.value === undefined || this.props.value === '' || (Array.isArray(this.props.value) && !this.props.value.length))) {
            if (this.props.schema.widget === 'ImageSelectAble') {
                return ' phải chọn ít nhất 1 ảnh'
            }
            return ' không được để trống';
        }

        if (this.props.schema.type === 'number' && (this.firsLoad === false || this.props.mode === 'edit')) {
            if (this.props.schema.min && (+this.props.schema.min) > (+this.props.data[this.props.schema.field] || 0)) {
                return ` không được nhỏ hơn ${(+this.props.schema.min || 0).toLocaleString()}`
            }
            if (this.props.schema.max && (+this.props.schema.max) < (+this.props.data[this.props.schema.field] || 0)) {
                return ` không được lớn hơn ${(+this.props.schema.max || 0).toLocaleString()}`
            }
        }
        if ((this.firsLoad === false || this.props.mode === 'edit') && this.props.schema.regex && this.props.value !== null && this.props.value !== undefined) {
            let str = this.props.schema.regex;
            let index = str.lastIndexOf(' ');
            if (index === -1) {
                index = str.length;
            }
            let left = str.substr(0, index), right = str.substr(index, str.length);
            let reg = new RegExp(left, right);
            if (Array.isArray(this.props.value)) {
                for (let i = 0; i < this.props.value.length; i++) {
                    const e = this.props.value[i];
                    if (!reg.test(e)) {
                        return this.props.schema.errorOnRegexFail || ' không đúng định dạng';
                    }
                }
            } else {
                if (!reg.test(this.props.value)) {
                    return this.props.schema.errorOnRegexFail || ' không đúng định dạng';
                }
            }

        }
        if ((this.firsLoad === false || this.props.mode === 'edit') && this.formRef && this.formRef.isInvalid)
            this.formRef.isInvalid();
    }

    render() {
        let Widget = Widgets[this.props.schema.widget];
        if (this.props.schema.widget === 'Text' && this.props.schema.isArrayInput) {
            Widget = Widgets.ArrayInput
        }
        if (!Widget) {
            return <p>Không tồn tại widget {this.props.schema.widget}</p>
        }
        if (this.props.submitted && this.firsLoad === true) {
            this.firsLoad = false;
        }
        let value = this.props.value;
        if ((value === undefined || value === null) && (this.props.schema.default)) {
            value = this.props.schema.default;
            if (this.props.schema.widget === 'JSONViewer') {
                try {
                    value = JSON.parse(this.props.schema.default);
                } catch (err) {

                }
            }
            if (this.props.onChange) {
                this.props.onChange(value)
            }
        }
        if (this.props.schema.type === 'custom_form_json' || this.props.schema.type === 'json') {
            return <FormGroup row>
                <Col md='12'>
                    <Widget ref={ref => { this.formRef = ref; }} onChange={this.props.onChange} submitted={this.props.submitted || false} data={this.props.data || {}} value={value} schema={this.props.schema} invalid={this.isInvalid() && !this.firsLoad} disabled={!!this.props.schema.disabled || false} />
                </Col>
            </FormGroup>
        }

        return <FormGroup row>
            <Col md='3' className='form-label-horizontal'>
                <Label><b>{this.props.schema.name} {this.props.schema.required ? '(*)' : ''}</b></Label>
            </Col>
            <Col md='9'>
                <Widget onChange={this.props.onChange}
                    submitted={this.props.submitted || false}
                    data={this.props.data || {}}
                    value={value}
                    schema={this.props.schema}
                    invalid={this.isInvalid() && !this.firsLoad}
                    disabled={!!this.props.schema.disabled || false}
                />
                {this.error()}
            </Col>
        </FormGroup>

    }
}

export default Base;