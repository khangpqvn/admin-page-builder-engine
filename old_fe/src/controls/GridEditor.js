import React, { Component } from 'react';
import {
  Button,
  Col,
  Input,
  Label,
  Row,
  Table
} from 'reactstrap';
import _ from 'lodash'
import Widgets from '../schema/Widgets';
import OrderableList from './OrderableList';
import ArrayEditor from '../controls/ArrayEditor';
const dataTypes = ['string', 'number', 'date', 'boolean'];
const display = ['image', 'progressbar'];
class GridEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data || [],
      apis: this.props.apis || [],
      currentItem: null,
      currentIndex: 0,
      error: null
    }
  }
  componentWillReceiveProps(next) {
    this.setState({ data: next.data || [], apis: next.apis || [] })
  }

  onPropertyClick(property) {
    this.setState({ pIndex: property })
  }
  onChange(dt) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }
  addItem() {
    let dt = this.props.data.splice(0);
    dt.push({});
    this.onChange(dt);
  }
  onItemDataChanged(name, val) {
    let dt = this.props.data.splice(0);
    dt[this.state.currentIndex][[name]] = val;
    this.onChange(dt);
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
    let currentItem = this.props.data[this.state.currentIndex];
    return (<div>
      <Col md={12}>
        <h5 className='card-title mb-0'>
          Grid
                    {this.props.onSave ? <Button className='pull-right' type="submit" size="md" onClick={this.save.bind(this)}><i className="fa fa-pencil"></i> Xác nhận</Button> : null}
        </h5>
        <div className='small text-muted'>Quản lý hiển thị bảng dữ liệu</div>
      </Col>
      <Row className='mt-1'>
        <Col md={2}>
          <OrderableList
            name={'Cột'}
            items={this.props.data}
            renderItem={(item, index) => {
              return (<div className={this.state.currentIndex === index ? 'item active' : 'item'} onClick={() => this.setState({ currentIndex: index })}>
                <div>{item.name || 'Chưa đặt tên'}{this.state.currentIndex === index ? <i className='fa fa-pencil pull-right' /> : null}</div>
                <span className='small text-muted'>{item.field}</span>
              </div>)
            }}
            activeIndex={this.state.currentIndex}
            onChange={(result) => {
              let dt = result.items.splice(0);
              this.onChange(dt);
              this.setState({ currentIndex: result.activeIndex })
            }}
            headerButtons={() => {
              return <Button color='default' className='pull-right' onClick={this.addItem.bind(this)}><i className='fa fa-plus' /></Button>
            }}
          />
        </Col>
        <Col md={10}>
          {currentItem ?
            <Table hover className='table-outline table-properties'>
              <thead className='thead-light'>
                <tr>
                  <th colSpan={2}>Thuộc tính
                  <Button color={'danger'} className='pull-right' onClick={this.deleteProperty.bind(this)}><i className='fa fa-remove' /> Xóa</Button>
                    <Button className='pull-right' color="success" onClick={this.coppyProperty.bind(this)}><i className="fa fa-copy" /> Sao chép</Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Label>Tên</Label>
                  </td>
                  <td>
                    <Input value={currentItem.name || ''} type="text" required onChange={e => { this.onItemDataChanged('name', e.target.value) }} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Label>Trường dữ liệu</Label>
                  </td>
                  <td>
                    <Input value={currentItem.field || ''} type="text" required onChange={e => { this.onItemDataChanged('field', e.target.value) }} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Label>Điều kiện ẩn</Label>
                  </td>
                  <td>
                    <Input value={currentItem.hideExpression || ''} type="text" required onChange={e => { this.onItemDataChanged('hideExpression', e.target.value) }} />
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
                      value={currentItem.roles || []}
                      onChange={e => {
                        this.onItemDataChanged('roles', e)
                      }} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Label>Kiểu dữ liệu</Label>
                  </td>
                  <td>
                    <Input type="select" value={currentItem.type || ''} onChange={e => { this.onItemDataChanged('type', e.target.value) }}>
                      <option key={-1} value={''}>Chưa chọn</option>
                      {dataTypes.map((d, index) => <option key={index} value={d}>{d}</option>)}
                    </Input>
                  </td>
                </tr>
                {currentItem.type === 'number' ? <React.Fragment>
                  <tr>
                    <td>
                      <Label>Format number</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox value={currentItem.formatNumber || false} onChange={val => { this.onItemDataChanged('formatNumber', val) }} />
                    </td>
                  </tr>
                </React.Fragment> : null}
                <tr>
                  <td>
                    <Label>Danh sách có sẵn</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.enumable || false} onChange={val => { this.onItemDataChanged('enumable', val) }} />
                  </td>
                </tr>
                {currentItem.enumable ? <React.Fragment>
                  <tr>
                    <td>
                      <Label>Các lựa chọn</Label>
                    </td>
                    <td>
                      <ArrayEditor value={currentItem.items || []} onChange={val => { this.onItemDataChanged('items', val) }} />
                    </td>
                  </tr>
                </React.Fragment> : null}
                <tr>
                  <td>
                    <Label>Danh sách chọn csdl</Label>
                  </td>
                  <td>
                    <Row>
                      <Col md="6">
                        Single select
                      <Widgets.Checkbox value={currentItem.modelSelect || false} onChange={val => {
                          this.onItemDataChanged('modelSelect', val);
                          if (currentItem.arraySelect) {
                            setTimeout(() => {
                              this.onItemDataChanged('arraySelect', false);
                            }, 30);
                          }
                        }} />
                      </Col>
                      <Col md="6">
                        Array select
                      <Widgets.Checkbox value={currentItem.arraySelect || false} onChange={val => {
                          this.onItemDataChanged('arraySelect', val);
                          if (currentItem.modelSelect) {
                            setTimeout(() => {
                              this.onItemDataChanged('modelSelect', false);
                            }, 30);
                          }
                        }} />
                      </Col>
                    </Row>
                  </td>
                </tr>
                {currentItem.modelSelect || currentItem.arraySelect ? <React.Fragment>
                  <tr>
                    <td>
                      <Label>Hàm xem danh sách</Label>
                    </td>
                    <td>
                      <Input type="select" value={currentItem.modelSelectApi || ''} onChange={e => { this.onItemDataChanged('modelSelectApi', e.target.value) }}>
                        <option key={-1} value={''}>Chưa chọn</option>
                        {this.props.apis.map((d, index) => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </Input>

                      {/* <Input type="select" value={currentItem.modelSelectApi} onChange={e => { this.onItemDataChanged('modelSelectApi', e.target.value) }}>
                        <option key={-1} value={''}>Chưa chọn</option>
                        {display.map((d, index) => <option key={index} value={d}>{d}</option>)}
                      </Input> */}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Lấy điều kiện ẩn tìm kiếm</Label>
                    </td>
                    <td>
                      <ArrayEditor value={currentItem.hiddenWhere} onChange={val => { this.onItemDataChanged('hiddenWhere', val) }} />
                    </td>
                  </tr>
                  <td>
                    <Label>Có thể Bỏ qua điều kiện tìm kiếm</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.allowByPassHiddenWhere || false} onChange={val => { this.onItemDataChanged('allowByPassHiddenWhere', val) }} />
                  </td>
                  <tr>
                    <td>
                      <Label>Hiển thị các trường dữ liệu</Label>
                    </td>
                    <td>
                      <Input value={currentItem.modelSelectField || ''} type="text" placeholder="Tiêu đề" required onChange={e => { this.onItemDataChanged('modelSelectField', e.target.value) }} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Trường hiển thị dữ liệu</Label>
                    </td>
                    <td>
                      <Input value={currentItem.select || ''} type="text" required onChange={e => { this.onItemDataChanged('select', e.target.value) }} />
                    </td>
                  </tr>

                </React.Fragment> : null}
                <tr>
                  <td>
                    <Label>Hiển thị</Label>
                  </td>
                  <td>
                    <Input type="select" value={currentItem.display || ''} onChange={e => { this.onItemDataChanged('display', e.target.value) }}>
                      <option key={-1} value={''}>Chưa chọn</option>
                      {display.map((d, index) => <option key={index} value={d}>{d}</option>)}
                    </Input>
                  </td>
                </tr>
                {currentItem.display === 'progressbar' ? <tr>
                  <td>
                    <Label>Màu ngược</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.reverseColor || false} onChange={val => { this.onItemDataChanged('reverseColor', val) }} />
                  </td>
                </tr> : null}
                {/* <tr>
                  <td>
                    <Label>Highlight</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.isHighlight || false} onChange={val => { this.onItemDataChanged('isHighlight', val) }} />
                  </td>
                </tr>
                {currentItem.isHighlight ?
                  <React.Fragment>
                    <tr>
                      <td>
                        <Label>Điều kiện Highlight</Label>
                      </td>
                      <td>
                        <Input value={currentItem.highlightExpression || ''} placeholder='{"this.missDeadline":{"=":1}}' type="text" required onChange={e => { this.onItemDataChanged('highlightExpression', e.target.value) }} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Label>Highlight color</Label>
                      </td>
                      <td>
                        <Input value={currentItem.highlightColor || ''} placeholder='red' type="text" required onChange={e => { this.onItemDataChanged('highlightColor', e.target.value) }} />
                      </td>
                    </tr>
                  </React.Fragment>
                  : null} */}
                <tr>
                  <td>
                    <Label>Cho phép lọc</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.filterable || false} onChange={val => { this.onItemDataChanged('filterable', val) }} />
                  </td>
                </tr>
                {currentItem.filterable ? <React.Fragment>
                  {currentItem.type !== 'string' ?
                    <tr>
                      <td>
                        <Label>Tìm theo khoảng</Label>
                      </td>
                      <td>
                        <Widgets.Checkbox value={currentItem.filterRange || false} onChange={val => { this.onItemDataChanged('filterRange', val) }} />
                      </td>
                    </tr> :
                    <tr>
                      <td>
                        <Label>String ID</Label>
                      </td>
                      <td>
                        <Widgets.Checkbox value={currentItem.stringID || false} onChange={val => { this.onItemDataChanged('stringID', val) }} />
                      </td>
                    </tr>
                  }

                </React.Fragment> : null}
                <tr>
                  <td>
                    <Label>Nút bấm thay thế</Label>
                  </td>
                  <td>
                    <Widgets.Checkbox value={currentItem.bindButton || false} onChange={val => { this.onItemDataChanged('bindButton', val) }} />
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

export default GridEditor;
