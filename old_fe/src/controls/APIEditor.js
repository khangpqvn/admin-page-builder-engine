import React, { Component } from 'react';
import {
    Button,
    Col,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap';
import OrderableList from './OrderableList';
import ArrayEditor from '../controls/ArrayEditor';
import Widgets from '../schema/Widgets';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const types = ['create', 'update', 'find'];

class APIEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apis: this.props.apis,
            currentAPI: null,
            currentIndex: 0,
            error: null
        }
    }
    componentWillReceiveProps(next) {
        this.setState({ apis: next.apis })
    }

    onPropertyClick(property) {
        this.setState({ pIndex: property })
    }
    addItem() {
        let dt = this.props.data.splice(0);
        dt.push({});
        this.onChange(dt);
    }
    onChange(dt) {
        if (this.props.onChange) {
            this.props.onChange(dt);
        }
    }
    onAPIDataChange(name, val) {
        let apis = this.props.data;
        let item = apis[this.state.currentIndex];
        item[[name]] = val;
        this.setState({ apis });
    }
    deleteProperty() {
        let dt = this.props.data.splice(0);
        dt.splice(this.state.currentIndex, 1);
        let currentIndex = this.state.currentIndex;
        currentIndex--;
        if (currentIndex < 0) currentIndex = 0;
        this.setState({ currentIndex });
        this.onChange(dt);
    }
    render() {
        let currentAPI = this.props.data[this.state.currentIndex];
        return (<div>
            <Col md={12}>
                <h5 className='card-title mb-0'>
                    API
                    {this.props.onSave ? <Button className='pull-right' type="submit" size="md" onClick={this.save.bind(this)}><i className="fa fa-pencil"></i> Xác nhận</Button> : null}
                </h5>
                <div className='small text-muted'>Quản lý API</div>
            </Col>
            <Row className='mt-1'>
                <Col md={2}>
                    <OrderableList
                        name={'API'}
                        items={this.props.data}
                        renderItem={(item, index) => {
                            return (<div className={this.state.currentIndex === index ? 'item active' : 'item'} onClick={() => this.setState({ currentIndex: index })}>
                                <div>{item.name || 'Chưa đặt tên'}{this.state.currentIndex === index ? <i className='fa fa-pencil pull-right' /> : null}</div>
                                <span className='small text-muted'>{item.url}</span>
                            </div>)
                        }}
                        activeIndex={this.state.currentIndex}
                        onChange={(result) => {
                            let dt = result.items.splice(0);
                            this.onChange(dt);
                            this.setState({ currentIndex: result.activeIndex })

                            this.setState({ apis: result.items, currentIndex: result.activeIndex })
                        }}
                        headerButtons={() => {
                            return <Button color='default' className='pull-right' onClick={this.addItem.bind(this)}><i className='fa fa-plus' /></Button>
                        }} />
                </Col>
                <Col md={10}>
                    {currentAPI ?
                        <Table hover className='table-outline table-properties'>
                            <thead className='thead-light'>
                                <tr>
                                    <th colSpan={2}>Thuộc tính<Button color={'danger'} className='pull-right' onClick={this.deleteProperty.bind(this)}><i className='fa fa-remove' /> Xóa</Button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <Label>Tên</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.name || ''} type="text" placeholder="Tiêu đề" required onChange={e => { this.onAPIDataChange('name', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Kiểu</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentAPI.type || ''} onChange={e => { this.onAPIDataChange('type', e.target.value) }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {types.map((d, index) => <option key={d} value={d}>{d}</option>)}
                                        </Input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Url</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.url || ''} type="text" required onChange={e => { this.onAPIDataChange('url', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Mô tả api</Label>
                                    </td>
                                    <td>
                                        <Input type="textarea" value={currentAPI.description || ''} required onChange={e => { this.onAPIDataChange('description', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Phương thức http</Label>
                                    </td>
                                    <td>
                                        <Input type="select" value={currentAPI.method || ''} onChange={e => { this.onAPIDataChange('method', e.target.value) }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {methods.map((d, index) => <option key={d} value={d}>{d}</option>)}
                                        </Input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Đi qua captcha</Label>
                                    </td>
                                    <td>
                                        <Widgets.Checkbox value={!!currentAPI.enableCaptcha || false} onChange={val => { this.onAPIDataChange('enableCaptcha', val) }} />
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
                                                modelSelectField: 'id,name',
                                                api: 'find_role'
                                            }}
                                            value={currentAPI.roles || []}
                                            onChange={e => {
                                                this.onAPIDataChange('roles', e)
                                            }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Tùy chọn gửi lên(update data)</Label>
                                    </td>
                                    <td>
                                        <ArrayEditor value={currentAPI.options || []} onChange={val => { this.onAPIDataChange('options', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Tùy chọn cập nhật(where)</Label>
                                    </td>
                                    <td>
                                        <ArrayEditor value={currentAPI.criterias || ''} onChange={val => { this.onAPIDataChange('criterias', val) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Dữ liệu gửi lên</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.requestFields || ''} type="text" required onChange={e => { this.onAPIDataChange('requestFields', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Dữ liệu Hạn chế gửi lên (restrict field)</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.restrictFields || ''} type="text" required onChange={e => { this.onAPIDataChange('restrictFields', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Dữ liệu trả về</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.responseFields || ''} type="text" required onChange={e => { this.onAPIDataChange('responseFields', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Query</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.fixedQuery || ''} type="text" placeholder="&abc=cdf&f=false" onChange={e => { this.onAPIDataChange('fixedQuery', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Bool Expression</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.boolExpression || ''} placeholder='Biểu thức tính quyền truy cập api theo thông tin người dùng và dữ liệu gửi lên' type="textarea" required onChange={e => { this.onAPIDataChange('boolExpression', e.target.value) }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Label>Xuất báo cáo</Label>
                                    </td>
                                    <td>
                                        <Input value={currentAPI.downloadReport || ''} type="text" required onChange={e => { this.onAPIDataChange('downloadReport', e.target.value) }} />
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

export default APIEditor;
