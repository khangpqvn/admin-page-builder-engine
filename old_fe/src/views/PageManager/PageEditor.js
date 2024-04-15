import React, { Component } from 'react';
import {
    Button, Card, CardBody, Col, Input, Row, FormGroup, Label, CardHeader,
    Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import helper from '../../services/helper';

import APIEditor from '../../controls/APIEditor';
import ButtonEditor from '../../controls/ButtonEditor';
import GridEditor from '../../controls/GridEditor';
import queryString from 'qs';
import Widgets from '../../schema/Widgets';
import SchemaEditor from '../../controls/SchemaEditor';
class PageEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            schema: [],
            data: {
            },
            apis: [],
            buttons: [],
            pageData: null,
            name: '',
            desc: '',
            read: '',
            pageInfo: null,
            roles: [],
            languages: [],
            additionalGrid: {}
        };
        this.query = queryString.parse(this.props.location.search, { ignoreQueryPrefix: true });
        this.loadData();
    }
    page = null;
    async loadData() {
        this.pageInfo = await helper.getPage(4);
        // console.log('PAGE INFO', this.pageInfo);
        if (this.query.mode === 'edit') {
            if (!this.query.id) {
                return this.setState({ error: 'Không có thông tin để tải dữ liệu' })
            }
            let rs = await helper.callPageApi(this.pageInfo, this.pageInfo.read, { queryInput: JSON.stringify({ id: this.query.id }) });
            this.setState({ additionalGrid: rs.data[0].additionalGrid || {}, schema: rs.data[0].schema, languages: rs.data[0].languages, roles: rs.data[0].roles, form: rs.data[0].form, name: rs.data[0].name, desc: rs.data[0].desc, apis: rs.data[0].apis || [], read: rs.data[0].read, buttons: rs.data[0].buttons, grid: rs.data[0].grid });
        }

    }
    componentWillReceiveProps(next) {
        this.query = queryString.parse(next.location.search, { ignoreQueryPrefix: true });
        this.loadData();
    }
    async saveData() {
        let input = {
            name: this.state.name,
            desc: this.state.desc,
            apis: this.state.apis,
            read: this.state.read,
            buttons: this.state.buttons,
            grid: this.state.grid,
            id: this.query.id,
            roles: this.state.roles,
            languages: this.state.languages,
            schema: this.state.schema,
            additionalGrid: this.state.additionalGrid
        }
        await helper.callPageApi(this.pageInfo, 'update', input);
        helper.alert('Cập nhật thành công');
    }
    async createPage() {
        let input = {
            name: this.state.name,
            desc: this.state.desc,
            apis: this.state.apis,
            read: this.state.read,
            languages: this.state.languages,
            buttons: this.state.buttons,
            grid: this.state.grid,
            schema: this.state.schema,
            roles: this.state.roles,
            additionalGrid: this.state.additionalGrid
        }
        await helper.callPageApi(this.pageInfo, 'create', input);
        helper.alert('Tạo mới thành công');
    }
    toggleTab(activeTab) {
        this.setState({ activeTab });
    }
    render() {
        let header = null;
        switch (this.query.mode) {
            case 'create':
                header = (<CardHeader>
                    <h3 className='pull-left'>Tạo trang mới</h3>
                    <Button className='pull-right' type="submit" size="md" color="success" onClick={this.createPage.bind(this)}><i className="fa fa-check"></i> Tạo mới</Button>
                </CardHeader>)
                break;
            case 'edit':
                header = (<CardHeader>
                    <h3 className='pull-left'>Sửa thông tin trang</h3>
                    <Button className='pull-right ml-1' type="submit" size="md" color="primary" onClick={this.saveData.bind(this)}><i className="fa fa-check"></i> Lưu thông tin</Button>
                    <Button className='pull-right' type="submit" size="md" color="success" onClick={this.createPage.bind(this)}><i className="fa fa-copy"></i> Sao chép</Button>
                </CardHeader>)
                break;
            default:
                break;
        }
        return (
            <Row>
                <Col md={12}>
                    <Card>
                        {header}
                        <CardBody>
                            <Row>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tên trang</Label>
                                        <Input value={this.state.name} type="text" placeholder="Tiêu đề" required onChange={e => { this.setState({ name: e.target.value }) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Mô tả</Label>
                                        <Input value={this.state.desc} type="text" placeholder="Nhập mô tả trang" required onChange={e => { this.setState({ desc: e.target.value }) }} />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Hàm tải dữ liệu</Label>
                                        <Input type="select" value={this.state.read} onChange={e => { this.setState({ read: e.target.value }) }}>
                                            <option key={-1} value={''}>Chưa chọn</option>
                                            {this.state.apis.map((d, index) => <option key={index} value={d.name}>{d.name}</option>)}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Ngôn ngữ</Label>
                                        <Widgets.ArrayModel
                                            schema={{
                                                pageId: 4,
                                                modelSelectField: 'id,name',
                                                api: 'find_lang'
                                            }}
                                            value={this.state.languages}
                                            onChange={e => {
                                                this.setState({ languages: e });
                                            }} />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Phân quyền</Label>
                                        <Widgets.ArrayModel
                                            schema={{
                                                pageId: 4,
                                                modelSelectField: 'id,name',
                                                api: 'find_role'
                                            }}
                                            value={this.state.roles}
                                            onChange={e => {
                                                this.setState({ roles: e });
                                            }} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {this.state.activeTab === 4 ? <Row>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Highlight:</Label>
                                        <Widgets.Checkbox value={this.state.additionalGrid.highlight || false} onChange={val => { this.state.additionalGrid.highlight = val; this.setState(this.state) }} />
                                    </FormGroup>
                                </Col>
                                {this.state.additionalGrid.highlight ?
                                    <React.Fragment>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label>Highlight Expression</Label>
                                                <Input value={this.state.additionalGrid.highlightExpression || ''} type="text" placeholder="" required onChange={e => { this.state.additionalGrid.highlightExpression = e.target.value; this.setState(this.state) }} />
                                            </FormGroup>
                                        </Col>
                                        <Col md={2}>
                                            <FormGroup>
                                                <Label>Highlight color</Label>
                                                <Input value={this.state.additionalGrid.highlightColor || ''} type="text" placeholder="" required onChange={e => { this.state.additionalGrid.highlightColor = e.target.value; this.setState(this.state) }} />
                                            </FormGroup>
                                        </Col>
                                    </React.Fragment>
                                    : null}
                            </Row> : null}
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab === 1}
                                        onClick={() => { this.toggleTab(1) }}>Form</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab === 2}
                                        onClick={() => { this.toggleTab(2) }}>Button</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab === 3}
                                        onClick={() => { this.toggleTab(3) }}>API</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab === 4}
                                        onClick={() => { this.toggleTab(4) }}>Grid</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab === 5}
                                        onClick={() => { this.toggleTab(5) }}>Form JSON</NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeTab}>
                                <TabPane tabId={1}>
                                    <SchemaEditor
                                        apis={this.state.apis}
                                        schema={this.state.schema}
                                        onChange={schema => {
                                            this.setState({ schema })
                                        }} />
                                    {/* <FormEditor apis={this.state.apis} schema={this.state.schema} uiSchema={this.state.uiSchema} onSave={(schema, uiSchema) => { this.setState({ schema, uiSchema }) }} /> */}
                                </TabPane>
                                <TabPane tabId={2}>
                                    <ButtonEditor data={this.state.buttons || []} apis={this.state.apis} onChange={buttons => { this.setState({ buttons }) }} />
                                </TabPane>
                                <TabPane tabId={3}>
                                    <APIEditor data={this.state.apis || []} onChange={apis => { this.setState({ apis }) }} />
                                </TabPane>
                                <TabPane tabId={4}>
                                    <GridEditor data={this.state.grid || []} apis={this.state.apis} onChange={grid => { this.setState({ grid }) }} />
                                </TabPane>
                                {/* <TabPane tabId={5}>
                                    <p>Tạm Close</p>
                                </TabPane> */}
                            </TabContent>
                        </CardBody>
                    </Card>
                </Col>
            </Row >
        );
    }
}

export default PageEditor;
