import React, { Component } from 'react';
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap';
import _ from 'lodash';
import Widgets from '../widget';
import ArrayEditor from '../controls/ArrayEditor';
import OrderableList from './OrderableList';
const uiSchemas = {
    'string': ['text', 'textarea', 'password', 'color', 'email', 'uri', 'data-url', 'ImageWidget', 'RichTextWidget', 'EnumWidget', 'JSONWidget', 'LocationWidget', 'MultipleImageWidget', 'Captcha'],
    'boolean': ['CheckboxWidget', 'select', 'EnumWidget'],
    'number': ['updown', 'range', 'radio', 'ModelSelectWidget', 'UploadWidget', 'EnumWidget', 'date', 'date-time'],
    'integer': ['updown', 'range', 'radio', 'ModelSelectWidget', 'UploadWidget', 'EnumWidget', 'date', 'date-time'],
    'array': ['ModelSelectWidget', 'ImageWidget']
}
const dataTypes = ['string', 'number', 'integer', 'boolean', 'array']
class FormEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: this.convertSchema(props.schema, props.uiSchema),
            currentIndex: 0
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ schema: this.convertSchema(next.schema, next.uiSchema) });
    }
    convertSchema(_schema, _uiSchema) {
        let schema = _.clone(_schema), uiSchema = _.clone(_uiSchema);
        if (!uiSchema) uiSchema = {};
        let properties = [];
        for (var i in schema.properties) {
            let prop = _.cloneDeep(schema.properties[i]);
            prop.uiSchema = uiSchema[i] || {};
            prop.fieldName = i;
            if (schema.required && _.includes(schema.required, i)) {
                prop.required = true;
            }
            properties.push(prop);
        }
        schema.properties = properties;
        return schema;
    }

    onPropertyClick(property) {
        this.setState({ currentIndex: property })
    }

    onPropertyDataChange(name, val) {
        let schema = _.clone(this.state.schema);
        schema.properties[this.state.currentIndex][name] = val;
        if (name === 'type' && val === 'array') {
            schema.properties[this.state.currentIndex].items = {
                type: "integer"
            }
        }
        this.setState({ schema });
    }

    onPropertyUISchemaChange(name, val) {
        let schema = this.state.schema;
        if (!schema.properties[this.state.currentIndex].uiSchema) schema.properties[this.state.currentIndex].uiSchema = {};
        schema.properties[this.state.currentIndex].uiSchema[name] = val;
        this.setState({ schema });
    }
    save() {
        let uiSchema = {}, properties = {}, schema = _.clone(this.state.schema),// Object.assign({}, this.state.schema),
            required = [];
        schema.properties.map(p => {
            let fieldName = p.fieldName;
            if (!_.isEmpty(p.uiSchema)) uiSchema[fieldName] = _.clone(p.uiSchema);
            if (p.type === 'string') {

            }
            switch (p.type) {
                case 'string': uiSchema[fieldName]['ui:emptyValue'] = ''; break;
                case 'number':
                case 'integer':
                case 'boolean':
                    uiSchema[fieldName]['ui:emptyValue'] = null; break;
                case 'array':
                    uiSchema[fieldName]['ui:emptyValue'] = []; break;
            }
            delete p.uiSchema;
            if (p.required) {
                required.push(p.fieldName);
            }
            delete p.fieldName;
            delete p.required;
            return properties[fieldName] = p;
        });
        schema.properties = properties;
        schema.required = required;
        this.props.onSave(schema, uiSchema);
    }

    addItem() {
        let schema = this.state.schema;
        schema.properties.push({ uiSchema: {}, title: '', type: '', fieldName: '', modelSelectField: 'id,name', classNames: 'col-md-12' });
        this.setState({ schema });
    }
    deleteProperty() {
        let schema = this.state.schema;
        schema.properties.splice(this.state.currentIndex, 1);
        let currentIndex = this.state.currentIndex;
        currentIndex--;
        if (currentIndex < 0) currentIndex = 0;
        this.setState({ schema, currentIndex });
    }

    coppyProperty() {
        let dt = this.props.data.splice(0);
        let clone = _.cloneDeep(dt[this.state.currentIndex]);
        for (let i = dt.length - 1; i > this.state.currentIndex; i--) {
            dt[i + 1] = _.cloneDeep(dt[i]);
        }
        dt[this.state.currentIndex + 1] = clone;
        this.onChange(dt);
    }


    render() {
        let currentProperty = this.state.schema.properties[this.state.currentIndex];
        let uis = [];
        if (currentProperty && currentProperty.type) {
            uis = uiSchemas[currentProperty.type] || [];
        }
        if (currentProperty) {

        }
        return (<div>
            <Col md={12}>
                <h5 className='card-title mb-0'>
                    Form
                    {this.props.onSave ? <Button className='pull-right' type="submit" size="md" onClick={this.save.bind(this)}><i className="fa fa-pencil"></i> Xác nhận</Button> : null}
                </h5>
                <div className='small text-muted'>Quản lý form</div>
            </Col>
            <Row>
                <Col md={4}>
                    <FormGroup>
                        <Label htmlFor="formTitle">Tên form</Label>
                        <Input value={this.state.schema.title} type="text" id="formTitle" placeholder="Tiêu đề" required onChange={e => {
                            let schema = this.state.schema;
                            schema.title = e.target.value;
                            this.setState(schema);
                        }} />
                    </FormGroup>
                </Col>
            </Row>
            <Row className='mt-1'>
                <Col md={2}>
                    <OrderableList
                        name={'Thuộc tính'}
                        items={this.state.schema.properties}
                        renderItem={(item, index) => {
                            return (<div className={this.state.currentIndex === index ? 'item active' : 'item'} onClick={() => this.setState({ currentIndex: index })}>
                                <div>
                                    {item.title || 'Chưa đặt tên'}  {item.required ? '*' : ''} {this.state.currentIndex === index ? <i className='fa fa-pencil pull-right' /> : null}
                                </div>
                                <span className='small text-muted'>{item.fieldName}</span>
                            </div>)
                        }}
                        activeIndex={this.state.currentIndex}
                        onChange={(result) => {
                            let schema = this.state.schema;
                            schema.properties = result.items;
                            this.setState({ schema, currentIndex: result.activeIndex })
                        }}
                        headerButtons={() => {
                            return <Button color='default' className='pull-right' onClick={this.addItem.bind(this)}><i className='fa fa-plus' /></Button>
                        }} />

                </Col>
                <Col md={10}>
                    {currentProperty ?
                        <Table hover className='table-outline table-properties'>
                            <thead className='thead-light'>
                                <tr>
                                    <th colSpan={2}>Thuộc tính
                                        <Button color={'danger'} className='pull-right' onClick={this.deleteProperty.bind(this)}><i className='fa fa-remove' /> Xóa</Button>
                                        <Button className='pull-right' color="success" onClick={this.coppyProperty.bind(this)}><i className="fa fa-copy" />Sao chép</Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <Label>Tên</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.title} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('title', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Trường dữ liệu</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.fieldName} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('fieldName', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Kiểu dữ liệu</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentProperty.type} onChange={e => {
                                            this.onPropertyDataChange('type', e.target.value)
                                        }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {dataTypes.map((d, index) => <option key={index} value={d}>{d}</option>)}
                                        </Input>
                                    </td>
                                </tr>

                                {currentProperty.type === 'array' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Kiểu dữ liệu phần tử</Label>
                                        </td>
                                        <td>
                                            <Input type="select" value={currentProperty.items.type} onChange={e => {
                                                let schema = _.clone(this.state.schema);
                                                schema.properties[this.state.currentIndex].items = { type: e.target.value };
                                                this.setState({ schema });
                                            }}>
                                                <option key={-1} value={''}>Chưa chọn</option>
                                                {dataTypes.map((d, index) => <option key={index} value={d}>{d}</option>)}
                                            </Input>
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                <tr>
                                    <td>
                                        <Label>Trường bắt buộc</Label>
                                    </td>
                                    <td>
                                        <Widgets.CheckboxWidget value={currentProperty.required} onChange={val => { this.onPropertyDataChange('required', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Vô hiệu hóa</Label>
                                    </td>
                                    <td>
                                        <Widgets.CheckboxWidget value={currentProperty.uiSchema['ui:disabled']} onChange={val => { this.onPropertyUISchemaChange('ui:disabled', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>CSS classes</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.classNames} type="text" placeholder="Classes" required onChange={e => { this.onPropertyDataChange('classNames', e.target.value) }} />
                                    </td>
                                </tr>
                                {currentProperty.type === 'integer' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Giá trị nhỏ nhất</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.minimum} type="text" required onChange={e => { this.onPropertyDataChange('minimum', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Giá trị lớn nhất</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.maximum} type="text" required onChange={e => { this.onPropertyDataChange('maximum', e.target.value) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                <tr>
                                    <td>
                                        <Label>Kiểu giao diện</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentProperty.uiSchema['ui:widget']} onChange={e => { this.onPropertyUISchemaChange('ui:widget', e.target.value) }}>
                                            <option key={-1} value={null}>Chưa chọn</option>
                                            {uis.map((u, schemaIndex) => <option key={schemaIndex} value={u}>{u}</option>)}
                                        </Input>
                                    </td>
                                </tr>
                                {currentProperty.uiSchema['ui:widget'] === 'ImageWidget'  ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Chiều rộng (width)</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.imageWidth} type="text" required onChange={e => { this.onPropertyDataChange('imageWidth', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Chiều cao (height)</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.imageHeight} type="text" required onChange={e => { this.onPropertyDataChange('imageHeight', e.target.value) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {currentProperty.uiSchema['ui:widget'] === 'EnumWidget' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Các lựa chọn</Label>
                                        </td>
                                        <td>
                                            <ArrayEditor value={currentProperty.items} onChange={val => { this.onPropertyDataChange('items', val) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {currentProperty.uiSchema['ui:widget'] === 'textarea' || currentProperty.uiSchema['ui:widget'] === 'RichTextWidget' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Số dòng hiển thị</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.numberOfLine || "5"} type="text" required onChange={e => { this.onPropertyDataChange('numberOfLine', e.target.value || "5") }} />

                                            {/* <Input type="select" value={currentProperty.items ? currentProperty.items.type : ''} onChange={e => {
                                                currentProperty.items = { type: e.target.value };
                                                let schema = this.state.schema;
                                                schema.properties[this.state.currentIndex] = currentProperty;
                                                this.setState({ schema });
                                            }}>
                                                <option key={-1} value={''}>Chưa chọn</option>
                                                {dataTypes.map((d, index) => <option key={index} value={d}>{d}</option>)}
                                            </Input> */}

                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {
                                    currentProperty.uiSchema['ui:widget'] === 'ModelSelectWidget' ? <React.Fragment>
                                        <tr>
                                            <td>
                                                <Label>Hàm lấy dữ liệu chọn</Label>
                                            </td>
                                            <td>
                                                <Input type="select" value={currentProperty.api} onChange={e => { this.onPropertyDataChange('api', e.target.value) }}>
                                                    <option key={-1} value={''}>Chưa chọn</option>
                                                    {this.props.apis.map((d, index) => <option key={d.name} value={d.name}>{d.name}</option>)}
                                                </Input>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label>Chọn nhiều giá trị</Label>
                                            </td>
                                            <td>
                                                <Widgets.CheckboxWidget value={currentProperty.modelSelectMultiple} onChange={val => { this.onPropertyDataChange('modelSelectMultiple', val) }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label>Hiển thị các trường dữ liệu</Label>
                                            </td>
                                            <td>
                                                <Input value={currentProperty.modelSelectField} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('modelSelectField', e.target.value) }} />
                                            </td>
                                        </tr>
                                    </React.Fragment> : null
                                }
                                <tr>
                                    <td>
                                        <Label>Điều kiện ẩn</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.hideExpression} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('hideExpression', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Mặc định</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.default || ''} type="text" placeholder="Giá trị mặc định" required onChange={e => { this.onPropertyDataChange('default', e.target.value) }} />
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        : null}
                </Col>
            </Row>
        </div>)
    }
}

export default FormEditor;
