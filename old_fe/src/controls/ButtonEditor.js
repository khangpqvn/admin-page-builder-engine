import React, { Component } from "react";
import { Button, Col, Input, Label, Row, Table } from "reactstrap";
import Widgets from "../schema/Widgets";
import OrderableList from "./OrderableList";
import _ from "lodash";
const buttonColors = [
  "default",
  "primary",
  "success",
  "danger",
  "info",
  "warning",
];

class ButtonEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentItem: null,
      currentIndex: 0,
    };
  }
  componentWillReceiveProps(next) {
    this.setState({ data: next.data || [], apis: next.apis || [] });
  }

  onPropertyClick(property) {
    this.setState({ pIndex: property });
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

  onChange(dt) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }
  render() {
    let currentItem = this.props.data[this.state.currentIndex];
    return (
      <div>
        <Col md={12}>
          <h5 className="card-title mb-0">
            Button
            {/* {this.props.onSave ? <Button className='pull-right' type="submit" size="md" onClick={this.save.bind(this)}><i className="fa fa-pencil"></i> Xác nhận</Button> : null} */}
          </h5>
          <div className="small text-muted">Quản lý các nút bấm trong form</div>
        </Col>
        <Row className="mt-1">
          <Col md={2}>
            <OrderableList
              name={"Nút bấm"}
              items={this.props.data}
              renderItem={(item, index) => {
                return (
                  <div
                    className={
                      this.state.currentIndex === index ? "item active" : "item"
                    }
                    onClick={() => this.setState({ currentIndex: index })}
                  >
                    <div>
                      {item.title || "Chưa đặt tên"}
                      {this.state.currentIndex === index ? (
                        <i className="fa fa-pencil pull-right" />
                      ) : null}
                    </div>
                    <span className="small text-muted">{item.mode}</span>
                  </div>
                );
              }}
              activeIndex={this.state.currentIndex}
              onChange={(result) => {
                let dt = result.items.splice(0);
                this.onChange(dt);
                this.setState({ currentIndex: result.activeIndex });
              }}
              headerButtons={() => {
                return (
                  <Button
                    color="default"
                    className="pull-right"
                    onClick={this.addItem.bind(this)}
                  >
                    <i className="fa fa-plus" />
                  </Button>
                );
              }}
            />
          </Col>
          <Col md={10}>
            {currentItem ? (
              <Table hover className="table-outline table-properties">
                <thead className="thead-light">
                  <tr>
                    <th colSpan={2}>
                      Thuộc tính
                      <Button
                        color={"danger"}
                        className="pull-right"
                        onClick={this.deleteProperty.bind(this)}
                      >
                        <i className="fa fa-remove" /> Xóa
                      </Button>
                      <Button
                        className="pull-right"
                        color="success"
                        onClick={this.coppyProperty.bind(this)}
                      >
                        <i className="fa fa-copy" /> Sao chép
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Label>Chế độ</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.mode || ""}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged("mode", e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Tên</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.title || ""}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged("title", e.target.value);
                        }}
                      />
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
                          modelSelectField: "id,name",
                          api: "find_role",
                        }}
                        value={currentItem.roles || []}
                        onChange={(e) => {
                          this.onItemDataChanged("roles", e);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Màu nút</Label>
                    </td>
                    <td>
                      <Input
                        type="select"
                        value={currentItem.color || ""}
                        onChange={(e) => {
                          this.onItemDataChanged("color", e.target.value);
                        }}
                      >
                        {buttonColors.map((d, index) => (
                          <option key={index} value={d}>
                            {d}
                          </option>
                        ))}
                      </Input>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Outline</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox
                        value={currentItem.outline || false}
                        onChange={(val) => {
                          this.onItemDataChanged("outline", val);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Biểu tượng</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.icon || ""}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged("icon", e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Hiển thị trên cột</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.column || ""}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged("column", e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                  {/* <tr>
                                    <td>
                                        <Label>Điều kiện hiển thị</Label>
                                    </td>
                                    <td>
                                        <Input value={currentItem.condition || ''} type="text" required onChange={e => { this.onItemDataChanged('condition', e.target.value) }} />
                                    </td>
                                </tr> */}
                  <tr>
                    <td>
                      <Label>Điều kiện ẩn</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.hideExpression || ""}
                        placeholder={`[ { "this.id": [ { "in": [10, "user.userType.id"] }, { ">": 10 }, { "<": "user.id", ">=": 1, "<=": 1 }, ] }, { "user.id": { "=": "this.id" } } ]`}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged(
                            "hideExpression",
                            e.target.value
                          );
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Kích hoạt</Label>
                    </td>
                    <td>
                      <Input
                        type="select"
                        value={currentItem.action || ""}
                        onChange={(e) => {
                          this.onItemDataChanged("action", e.target.value);
                        }}
                      >
                        <option key={1} value={""}>
                          Chưa chọn
                        </option>
                        <option key={2} value={"api"}>
                          Gọi hàm
                        </option>
                        <option key={3} value={"url"}>
                          Chuyển hướng
                        </option>
                        <option key={4} value={"report"}>
                          Báo cáo
                        </option>
                        <option key={5} value={"formModal"}>
                          Form Popup
                        </option>
                        <option key={6} value={"listModal"}>
                          List Popup
                        </option>
                        <option key={7} value={"disable"}>
                          Disable
                        </option>
                      </Input>
                    </td>
                  </tr>
                  {currentItem.action === "report" ? (
                    <React.Fragment>
                      <tr>
                        <td>
                          <Label>File name</Label>
                        </td>
                        <td>
                          <Input
                            value={currentItem.reportName || ""}
                            type="text"
                            required
                            onChange={(e) => {
                              this.onItemDataChanged(
                                "reportName",
                                e.target.value
                              );
                            }}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ) : null}
                  {currentItem.action === "formModal" ||
                  currentItem.action === "listModal" ? (
                    <React.Fragment>
                      <tr>
                        <td>
                          <Label>Dữ liệu nhúng</Label>
                        </td>
                        <td>
                          <Input
                            value={currentItem.modalQuery || ""}
                            type="text"
                            required
                            onChange={(e) => {
                              this.onItemDataChanged(
                                "modalQuery",
                                e.target.value
                              );
                            }}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ) : null}
                  {currentItem.action === "url" ? (
                    <React.Fragment>
                      <tr>
                        <td>
                          <Label>Chuyển hướng</Label>
                        </td>
                        <td>
                          <Input
                            value={currentItem.url || ""}
                            type="text"
                            required
                            onChange={(e) => {
                              this.onItemDataChanged("url", e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                      <td>
                        <Label>Target</Label>
                      </td>
                      <td>
                        <Input
                          type="select"
                          value={currentItem.target || "_self"}
                          onChange={(e) => {
                            this.onItemDataChanged("target", e.target.value);
                          }}
                        >
                          <option key={"_self"} value={"_self"}>
                            _self
                          </option>
                          <option key={"_blank"} value={"_blank"}>
                            _blank
                          </option>
                          <option key={"_parent"} value={"_parent"}>
                            _parent
                          </option>
                          <option key={"_top"} value={"_top"}>
                            _top
                          </option>
                        </Input>
                      </td>
                    </React.Fragment>
                  ) : null}
                  {currentItem.action === "api" ||
                  currentItem.action === "report" ? (
                    <React.Fragment>
                      <tr>
                        <td>
                          <Label>Gọi hàm</Label>
                        </td>
                        <td>
                          <Input
                            type="select"
                            value={currentItem.api || ""}
                            onChange={(e) => {
                              this.onItemDataChanged("api", e.target.value);
                            }}
                          >
                            <option key={-1} value={""}>
                              Chưa chọn
                            </option>
                            {this.props.apis.map((d, index) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </Input>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Label>Dữ liệu nhúng</Label>
                        </td>
                        <td>
                          <Input
                            value={currentItem.apiData || ""}
                            placeholder={`{"fileId":"this.id"}`}
                            type="text"
                            required
                            onChange={(e) => {
                              this.onItemDataChanged("apiData", e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ) : null}
                  <tr>
                    <td>
                      <Label>Xác nhận</Label>
                    </td>
                    <td>
                      <Input
                        value={currentItem.confirm || ""}
                        type="text"
                        required
                        onChange={(e) => {
                          this.onItemDataChanged("confirm", e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Quay lại sau khi submit</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox
                        value={currentItem.backOnDone || false}
                        onChange={(val) => {
                          this.onItemDataChanged("backOnDone", val);
                        }}
                      />
                    </td>
                  </tr>
                  {currentItem.backOnDone ? (
                    <React.Fragment>
                      <tr>
                        <td>
                          <Label>Quay lại sau khi submit HREF</Label>
                        </td>
                        <td>
                        <Input
                            value={currentItem.backOnDoneHref || ""}
                            placeholder={`href`}
                            type="text"
                            required
                            onChange={(e) => {
                              this.onItemDataChanged("backOnDoneHref", e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ) : null}

                  <tr>
                    <td>
                      <Label>Nhúng dữ liệu URL</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox
                        value={currentItem.embedUrl || false}
                        onChange={(val) => {
                          this.onItemDataChanged("embedUrl", val);
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <Label>Kiểu nút</Label>
                    </td>
                    <td>
                      <Input
                        type="select"
                        value={currentItem.type || ""}
                        onChange={(e) => {
                          this.onItemDataChanged("type", e.target.value);
                        }}
                      >
                        <option key={1} value={""}>
                          Chưa chọn
                        </option>
                        <option key={2} value={"button"}>
                          button
                        </option>
                        <option key={3} value={"submit"}>
                          submit
                        </option>
                        <option key={4} value={"switch"}>
                          switch
                        </option>
                      </Input>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Show on top</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox
                        value={currentItem.showOnTop || false}
                        onChange={(val) => {
                          this.onItemDataChanged("showOnTop", val);
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Label>Show on form only</Label>
                    </td>
                    <td>
                      <Widgets.Checkbox
                        value={currentItem.showOnFormOnly || false}
                        onChange={(val) => {
                          this.onItemDataChanged("showOnFormOnly", val);
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            ) : null}
          </Col>
        </Row>
      </div>
    );
  }
}

export default ButtonEditor;
