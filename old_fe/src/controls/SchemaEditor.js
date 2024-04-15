import React, { Component } from 'react';
import {
    Button,
    Col,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap';
import _ from 'lodash';
import Widgets from '../schema/Widgets';
import ArrayEditor from '../controls/ArrayEditor';
import OrderableList from './OrderableList';
const widgets = {
    'string': ['Text', 'TextArea', 'Image', 'Enum', 'EnumButton', 'EnumMultipleSelect', 'Location', 'RichText', 'ArrayImage', 'SingleModel', 'Upload', 'ArrayModel', 'ImageViewer', 'ImageSelectAble', 'Password', 'Captcha', 'JSONViewer', "HTML"],
    'boolean': ['Checkbox'],
    'number': ['Text', 'Date', 'Time', 'Enum', 'EnumButton', 'EnumMultipleSelect', 'SingleModel', 'ArrayModel', 'Upload'],
    'custom_form_json': ['CVSS'],
    'json': ['FormViewer', 'ArrayFormViewer']
}
const dataTypes = Object.keys(widgets)
class SchemaEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0
        }
    }

    onPropertyClick(property) {
        this.setState({ currentIndex: property })
    }

    onPropertyDataChange(name, val) {
        let schema = this.props.schema.splice(0);
        schema[this.state.currentIndex][name] = val;
        this.onChange(schema);
    }

    addItem() {
        let dt = this.props.schema.splice(0);
        dt.push({});
        this.onChange(dt);
    }
    deleteProperty() {
        let dt = this.props.schema.splice(0);
        dt.splice(this.state.currentIndex, 1);
        this.onChange(dt);
    }

    coppyProperty() {
        let dt = this.props.schema.splice(0);
        let clone = _.cloneDeep(dt[this.state.currentIndex]);
        for (let i = dt.length - 1; i > this.state.currentIndex; i--) {
            dt[i + 1] = _.cloneDeep(dt[i]);
        }
        dt[this.state.currentIndex + 1] = clone;
        this.onChange(dt);
    }

    onChange(dt) {
        if (this.props.onChange) {
            this.props.onChange(dt);
        }
    }
    render() {
        let currentProperty = this.props.schema[this.state.currentIndex];
        return (<div>
            <Col md={12}>
                <h5 className='card-title mb-0'>
                    Form
                    {this.props.onSave ? <Button className='pull-right' type="submit" size="md" onClick={this.save.bind(this)}><i className="fa fa-pencil"></i> Xác nhận</Button> : null}
                </h5>
                <div className='small text-muted'>Quản lý form</div>
            </Col>
            <Row className='mt-1'>
                <Col md={2}>
                    <OrderableList
                        name={'Thuộc tính'}
                        items={this.props.schema}
                        renderItem={(item, index) => {
                            return (<div className={this.state.currentIndex === index ? 'item active' : 'item'} onClick={() => this.setState({ currentIndex: index })}>
                                <div>
                                    {item.name || 'Chưa đặt tên'}  {item.required ? '*' : ''} {this.state.currentIndex === index ? <i className='fa fa-pencil pull-right' /> : null}
                                </div>
                                <span className='small text-muted'>{item.field}</span>
                            </div>)
                        }}
                        activeIndex={this.state.currentIndex}
                        onChange={(result) => {
                            let dt = _.clone(result.items);
                            this.onChange(dt);
                            this.setState({ schema: dt, currentIndex: result.activeIndex })
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
                                        <Input value={currentProperty.name || ''} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('name', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Trường dữ liệu</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.field || ''} type="text" placeholder="Trường dữ liệu" required onChange={e => { this.onPropertyDataChange('field', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Placeholder</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.placeholder || ''} type="text" placeholder="Placeholder" required onChange={e => { this.onPropertyDataChange('placeholder', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Phân quyền</Label>
                                    </td>
                                    <td>
                                        <Widgets.ArrayModel
                                            schema={{
                                                pageId: 4,
                                                modelSelectMultiple: true,
                                                modelSelectField: 'id,name$$Tên',
                                                api: 'find_role'
                                            }}
                                            value={currentProperty.roles || []}
                                            onChange={e => {
                                                this.onPropertyDataChange('roles', e)
                                            }} />
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <Label>Trường bắt buộc</Label>
                                    </td>
                                    <td>
                                        <Widgets.Checkbox value={currentProperty.required || false} onChange={val => { this.onPropertyDataChange('required', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Điều kiện bắt buộc </Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.requiredExpression || ''} type="text" placeholder="Điều kiện bắt buộc" required onChange={e => { this.onPropertyDataChange('requiredExpression', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Vô hiệu hóa</Label>
                                    </td>
                                    <td>
                                        <Widgets.Checkbox value={currentProperty.disabled || false} onChange={val => { this.onPropertyDataChange('disabled', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Điều kiện vô hiệu hóa </Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.disabledExpression || ''} type="text" placeholder="Điều kiện vô hiệu hóa" required onChange={e => { this.onPropertyDataChange('disabledExpression', e.target.value) }} />
                                    </td>
                                </tr>
                                {/* <tr>
                                    <td>
                                        <Label>CSS classes</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.classNames || ''} type="text" placeholder="Classes" required onChange={e => { this.onPropertyDataChange('classNames', e.target.value) }} />
                                    </td>
                                </tr> */}
                                <tr>
                                    <td>
                                        <Label>Kiểu dữ liệu</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentProperty.type || ''} onChange={e => {
                                            this.onPropertyDataChange('type', e.target.value)
                                        }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {dataTypes.map((d, index) => <option key={index} value={d}>{d}</option>)}
                                        </Input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Kiểu giao diện</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentProperty.widget || ''} onChange={e => { this.onPropertyDataChange('widget', e.target.value) }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {(widgets[currentProperty.type] || []).map((u, schemaIndex) => <option key={schemaIndex} value={u}>{u}</option>)}
                                        </Input>
                                    </td>
                                </tr>
                                {currentProperty.widget === 'Text' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Array input</Label>
                                        </td>
                                        <td>
                                            <Widgets.Checkbox value={currentProperty.isArrayInput || false} onChange={val => { this.onPropertyDataChange('isArrayInput', val) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {currentProperty.widget === 'TextArea' || currentProperty.widget === 'RichText' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Số dòng hiển thị</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.numberOfLine || "5"} type="text" required onChange={e => { this.onPropertyDataChange('numberOfLine', e.target.value || "5") }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}

                                {currentProperty.isArrayInput || currentProperty.widget === 'ArrayFormViewer' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Tên button thêm</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.addButonName || ''} type="text" required onChange={e => { this.onPropertyDataChange('addButonName', e.target.value) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {currentProperty.widget === 'Text' && currentProperty.type === 'number' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Giá trị nhỏ nhất</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.min || ''} type="number" required onChange={e => { this.onPropertyDataChange('min', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Giá trị lớn nhất</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.max || ''} type="number" required onChange={e => { this.onPropertyDataChange('max', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Đọc số</Label>
                                        </td>
                                        <td>
                                            <Widgets.Checkbox value={currentProperty.enableReadNumber || false} onChange={val => { this.onPropertyDataChange('enableReadNumber', val) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {(currentProperty.widget === 'Text' || currentProperty.widget === 'Password') && currentProperty.type === 'string' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>REGEX (REGEX FLAG)</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.regex || ''} type="text" required onChange={e => { this.onPropertyDataChange('regex', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Lỗi báo regex test fail</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.errorOnRegexFail || ''} type="text" required onChange={e => { this.onPropertyDataChange('errorOnRegexFail', e.target.value) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}

                                {currentProperty.widget === 'Image' || currentProperty.widget === 'ArrayImage' ? <React.Fragment>
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
                                {['EnumMultipleSelect', 'Enum', 'EnumButton'].includes(currentProperty.widget) ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Các lựa chọn</Label>
                                        </td>
                                        <td>
                                            <ArrayEditor value={currentProperty.items} onChange={val => { this.onPropertyDataChange('items', val) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {currentProperty.widget === 'EnumButton' || currentProperty.widget === 'EnumMultipleSelect' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Width (%)</Label>
                                        </td>
                                        <td>
                                            <Input value={currentProperty.EnumButtonWidth} min={0} max={100} type="number" step="1" required onChange={e => { this.onPropertyDataChange('EnumButtonWidth', e.target.value) }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label>Margin right</Label>
                                        </td>
                                        <td>
                                            <Widgets.Checkbox value={currentProperty.marginRight || false} onChange={val => { this.onPropertyDataChange('marginRight', val) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null}
                                {
                                    currentProperty.widget === 'SingleModel' || currentProperty.widget === 'ArrayModel' ? <React.Fragment>
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
                                                <Label>Hiển thị cả Id</Label>
                                            </td>
                                            <td>
                                                <Widgets.Checkbox value={currentProperty.showWithId || false} onChange={val => { this.onPropertyDataChange('showWithId', val) }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label>Lấy điều kiện ẩn tìm kiếm</Label>
                                            </td>
                                            <td>
                                                <ArrayEditor value={currentProperty.hiddenWhere} onChange={val => { this.onPropertyDataChange('hiddenWhere', val) }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label>Hiển thị các trường dữ liệu</Label>
                                            </td>
                                            <td>
                                                <Input value={currentProperty.modelSelectField || ''} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('modelSelectField', e.target.value) }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label>Trường lấy dữ liệu hiển thị</Label>
                                            </td>
                                            <td>
                                                <Input value={currentProperty.select || ''} type="text" placeholder="defaultsTo name" required onChange={e => { this.onPropertyDataChange('select', e.target.value) }} />
                                            </td>
                                        </tr>
                                    </React.Fragment> : null
                                }
                                {currentProperty.widget === 'FormViewer' || currentProperty.widget === 'ArrayFormViewer' ? <React.Fragment>
                                    <tr>
                                        <td>
                                            <Label>Page</Label>
                                        </td>
                                        <td>
                                            <Input value={+currentProperty.page || 0} type="text" required onChange={e => { this.onPropertyDataChange('page', +e.target.value) }} />
                                        </td>
                                    </tr>
                                </React.Fragment> : null
                                }
                                {/* {
                                    currentProperty.widget === 'SingleModel' ? <React.Fragment>
                                         <tr>
                                            <td>
                                                <Label>Trường dữ liệu ẩn</Label>
                                            </td>
                                            <td>
                                                <Input value={currentProperty.hiddenField || ''} type="text" placeholder="Tiêu đề" required onChange={e => { this.onPropertyDataChange('hiddenField', e.target.value) }} />
                                            </td>
                                        </tr>
                                         </React.Fragment> : null
                                } */}
                                <tr>
                                    <td>
                                        <Label>Điều kiện ẩn</Label>
                                    </td>
                                    <td>
                                        <Input value={currentProperty.hideExpression || ''} type="text" placeholder="Điều kiện ẩn" required onChange={e => { this.onPropertyDataChange('hideExpression', e.target.value) }} />
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

export default SchemaEditor;
