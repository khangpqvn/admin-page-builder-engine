import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Row,
  CardHeader,
  Input,
  Progress
} from "reactstrap";
import helper from "../services/helper";
import ReactTable from "react-table";
import withFixedColumns from "react-table-hoc-fixed-columns";
import Moment from "react-moment";
import _ from "lodash";
import moment from "moment";
import Widgets from "../schema/Widgets";
import config from "../services/config";
import { Modal, ModalBody, ModalFooter } from "reactstrap";
import FormCtrl from "./FormCtrl";
import ImageViewer from "./ImageViewer";
import Loader from "./Loader";
import local from "../services/local";
const ReactTableFixedColumns = withFixedColumns(ReactTable);
const PROGRESS_COLORS = ["success", "info", "warning", "danger"];
const DEFAULT_FILTER_WAITIME = 350;
const DEFAULT_RESIZE_WAITIME = 350;

Array.prototype.concatUnique = function(arr = []) {
  if (Array.isArray(arr)) {
    let currentArr = this;
    return _.union(currentArr, arr);
    // return [...new Set([...currentArr, ...arr])];
  }
  throw new Error("INPUT_INVALID");
};

class ListCtrl extends Component {
  constructor(props) {
    super(props);
    this.query = props.query; // queryString.parse(props.location.search, { ignoreQueryPrefix: true });
    // console.log({ localStorage: local.get('isHideButton') })
    // console.log({ localStorage2: local.get('isHideButton') === 'true' })
    let isHideButton = !!local.get("isHideButton");
    if (
      props.query.hideButton !== undefined &&
      props.query.hideButton !== null
    ) {
      isHideButton = !!props.query.hideButton;
    }
    this.state = {
      data: [],
      pageInfo: null,
      error: null,
      columns: [],
      modelSelect: {},
      modelSelectIds: {},
      currentFilter: {},
      tbl: null,
      modalQuery: {},
      isShowModal: false,
      tblFilter: [],
      currentModal: null,
      width: 0,
      height: 0,
      hideButton: isHideButton,
      itemsPerPage: props.query.itemsPerPage || 10
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    // window.addEventListener('resize', this.updateWindowDimensions);
  }
  // itemsPerPage = this.state.itemsPerPage || 10;
  firstLoad = true;
  pageInfo = null;
  lastFilterChange = 0;
  componentDidMount() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", this.updateWindowDimensions);
    this.init(this.props);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  resizeTimer = null;
  updateWindowDimensions() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
      this.createColumnsData(this.state.pageInfo);
    }, DEFAULT_RESIZE_WAITIME);
  }

  componentWillReceiveProps(next) {
    // console.log({ listNext: next })
    if (!_.isEqual(next, this.props)) {
      this.query = next.query;
      this.init(next);
    }
  }
  async init(props) {
    this.setState({ pageInfo: null });
    let pageInfo = await helper.getPage(props.query.page);
    this.setState({ pageInfo });
    if (!pageInfo) return helper.alert("Page not found");
    if (!Array.isArray(pageInfo.buttons)) pageInfo.buttons = [];
    if (!Array.isArray(pageInfo.grid)) pageInfo.grid = [];

    await this.setState({
      mode: props.query.mode
    });
    this.fetchData();
  }
  search() {
    this.currentPage = 1;
    this.setState({ data: [], count: 0 });
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }
  handleFilterChange(name, val) {
    this.setState({ filter: { ...this.state.filter, [name]: val } });
  }
  toggleFade() {
    this.setState(prevState => {
      return { fadeIn: !prevState };
    });
  }

  filterSetTimeoutInstance;
  async fetchData(tbl) {
    let rangeFilter = moment().valueOf() - this.lastFilterChange;

    if (rangeFilter < DEFAULT_FILTER_WAITIME) {
      if (this.filterSetTimeoutInstance) {
        clearTimeout(this.filterSetTimeoutInstance);
      }
      this.filterSetTimeoutInstance = setTimeout(() => {
        this.fetchData(tbl);
      }, DEFAULT_FILTER_WAITIME - rangeFilter);
      return;
    }
    if (tbl) {
      this.setState({ tbl });
    }
    if (this.state.loading) return;
    this.setState({ loading: true });
    let filter = {},
      skip = 0,
      limit = this.state.itemsPerPage,
      sort = [];

    if (tbl && tbl.filtered) {
      filter = this.calculateFilter(tbl.filtered);
      skip = tbl.pageSize * tbl.page;
      limit = tbl.pageSize;
    }

    if (tbl && tbl.sorted) {
      tbl.sorted.map(s => {
        sort.push({
          [s.id]: s.desc ? "desc" : "asc"
        });
        return null;
      });
    }
    if (sort.length === 0) sort = [{ createdAt: "desc" }];
    if (this.query.filter) {
      let b = helper.parseQueryData(this.query.filter);
      if (b) {
        filter = Object.assign(filter, b);
      }
    }
    // for (var i in filter) {
    // }
    let input = { queryInput: JSON.stringify(filter), limit, skip };
    if (sort) {
      input.sort = JSON.stringify(sort);
    }
    let rs = await helper.callPageApi(
      this.state.pageInfo,
      this.state.pageInfo.read,
      Object.assign(this.query, input)
    );
    let modelSelect = {},
      modelSelectIds = {},
      arraySelect = {},
      arraySelectIds = {};
    rs.data.map(d => {
      this.state.pageInfo.grid.map(g => {
        if (g.modelSelect) {
          if (!modelSelectIds[g.field]) modelSelectIds[g.field] = [];
          if (d[g.field] && !_.includes(modelSelectIds[g.field], d[g.field]))
            modelSelectIds[g.field].push(d[g.field]);
        }
        if (g.arraySelect) {
          if (!arraySelectIds[g.field]) arraySelectIds[g.field] = [];
          if (
            d[g.field] &&
            _.intersection(arraySelectIds[g.field], d[g.field]).length !==
              d[g.field].length
          ) {
            arraySelectIds[g.field] = arraySelectIds[g.field].concatUnique(
              d[g.field]
            );
          }
        }
        return null;
      });
      return null;
    });
    for (var i = 0; i < this.state.pageInfo.grid.length; i++) {
      if (this.state.pageInfo.grid[i].modelSelect) {
        let gInfo = this.state.pageInfo.grid[i];
        if (
          !(
            modelSelectIds[gInfo.field] &&
            modelSelectIds[gInfo.field].length > 0
          )
        )
          continue;
        let rs = await helper.callPageApi(
          this.state.pageInfo,
          gInfo.modelSelectApi,
          { queryInput: JSON.stringify({ id: modelSelectIds[gInfo.field] }) }
        );
        modelSelect[gInfo.field] = rs.data;
      } else if (this.state.pageInfo.grid[i].arraySelect) {
        let gInfo = this.state.pageInfo.grid[i];
        if (
          !(
            arraySelectIds[gInfo.field] &&
            arraySelectIds[gInfo.field].length > 0
          )
        )
          continue;
        let rs = await helper.callPageApi(
          this.state.pageInfo,
          gInfo.modelSelectApi,
          { queryInput: JSON.stringify({ id: arraySelectIds[gInfo.field] }) }
        );
        arraySelect[gInfo.field] = rs.data;
      }
    }

    let a = {
      data: rs.data,
      modelSelect,
      arraySelect,
      count: rs.count,
      loading: false,
      nPage: Math.ceil(rs.count / limit),
      currentFilter: input
    };
    console.log({ a });
    this.setState(a, () => {
      setTimeout(() => {
        this.createColumnsData(this.state.pageInfo);
      }, 100);
    });
  }
  calculateFilter(filter) {
    let obj = {};
    filter.map(f => {
      for (var i = 0; i < this.state.pageInfo.grid.length; i++) {
        let gridInfo = this.state.pageInfo.grid[i];
        if (gridInfo.field === f.id) {
          if (gridInfo.modelSelect) {
            if (_.isArray(f.value) && f.value.length > 0) {
              obj[f.id] = f.value;
            }
          } else if (gridInfo.arraySelect) {
            // console.log({ arraySelect: f.id })
            if (_.isArray(f.value) && f.value.length > 0) {
              let tmp = { or: [] };
              for (let i = 0; i < f.value.length; i++) {
                const element = f.value[i];
                tmp.or.push({ [f.id]: { contains: `[${element}]` } });
                tmp.or.push({ [f.id]: { contains: `,${element}]` } });
                tmp.or.push({ [f.id]: { contains: `[${element},` } });
                tmp.or.push({ [f.id]: { contains: `,${element},` } });
              }
              obj.and.push(tmp);
            } else {
              obj[f.id] = { contains: f.value };
            }
          } else {
            switch (gridInfo.type) {
              case "string":
                if (gridInfo.stringID) {
                  obj[f.id] = f.value;
                } else {
                  obj[f.id] = { contains: f.value };
                }
                break;
              case "stringID":
                obj[f.id] = f.value;
                break;
              case "integer":
              case "number":
              case "boolean":
                if (gridInfo.filterRange) {
                  if (_.isArray(f.value)) {
                    if (f.value[0]) {
                      if (!obj[f.id]) obj[f.id] = {};
                      obj[f.id][">="] = Number(f.value[0]);
                    }
                    if (f.value[1]) {
                      if (!obj[f.id]) obj[f.id] = {};
                      obj[f.id]["<="] = Number(f.value[1]);
                    }
                  }
                } else {
                  obj[f.id] = Number(f.value);
                }
                break;
              case "date":
                if (gridInfo.filterRange) {
                  if (_.isArray(f.value)) {
                    if (f.value[0]) {
                      if (!obj[f.id]) obj[f.id] = {};
                      obj[f.id][">="] = f.value[0];
                    }
                    if (f.value[1]) {
                      if (!obj[f.id]) obj[f.id] = {};
                      obj[f.id]["<="] = f.value[1];
                    }
                  }
                } else {
                  if (f.value) {
                    obj[f.id] = {
                      ">=": moment(f.value)
                        .startOf("day")
                        .valueOf(),
                      "<=": moment(f.value)
                        .endOf("day")
                        .valueOf()
                    };
                  }
                }
                break;
              default:
                obj[f.id] = { contains: f.value };
                break;
            }
          }
        }
      }
      return 0;
    });
    return obj;
  }
  onChange(data) {
    this.setState({ data });
  }
  closeModal() {
    this.fetchData(this.state.tbl);
    if (this.props.onReloadData) {
      this.props.onReloadData();
    }
    this.setState({ isShowModal: false });
  }
  async onButtonClick(btnInfo, data) {
    try {
      var i;
      switch (btnInfo.action) {
        case "api":
        case "report":
          if (!data) data = {};
          if (btnInfo.confirm) {
            let confirmText = btnInfo.confirm;
            for (i in data) {
              confirmText = helper.replaceAll(
                confirmText,
                "#" + i + "#",
                data[i]
              );
            }
            let rs = await helper.confirm(confirmText);
            if (!rs) return;
          }
          if (this.query.embed && btnInfo.embedUrl) {
            let a = helper.parseQueryData(this.query.embed);
            if (a) {
              data = Object.assign(data || {}, a);
            }
          }
          let submitData = Object.assign({}, data);

          if (btnInfo.apiData) {
            try {
              let tmpApiData = JSON.parse(btnInfo.apiData);
              for (const key in tmpApiData) {
                if (tmpApiData.hasOwnProperty(key)) {
                  const e = tmpApiData[key];
                  submitData[key] = helper.getFieldReferValue(e, data);
                }
              }
            } catch (error) {
              console.error(error);
              helper.alert(
                "Đã có lỗi xảy ra, xin vui lòng liên hệ đội phát triển để kiểm tra lại"
              );
              break;
            }
          }
          if (btnInfo.action === "api") {
            let rs = await helper.callPageApi(
              this.state.pageInfo,
              btnInfo.api,
              submitData
            );
            if (rs.open_url) {
              window.open(rs.open_url, rs.target || "_self", "noreferrer");
              if (rs.target !== "_blank") {
                return;
              }
            } else {
              helper.alert(rs.message || "Thành công");
            }
            this.fetchData(this.state.tbl);
          } else {
            await helper.report(
              this.state.pageInfo,
              btnInfo.api,
              submitData,
              btnInfo.reportName || "report"
            );
          }

          break;
        case "formModal":
          let raw = btnInfo.modalQuery;
          if (this.query.embed && btnInfo.embedUrl) {
            let a = helper.parseQueryData(this.query.embed);
            if (a) {
              data = Object.assign(data || {}, a);
            }
          }
          for (i in data) {
            raw = helper.replaceAll(raw, "#" + i + "#", data[i]);
          }
          let query = JSON.parse(raw);
          if (!query.modalType) query.modalType = "form";
          let currentModal = FormCtrl;
          switch (query.modalType) {
            case "form":
            default:
              currentModal = FormCtrl;
              break;
          }
          this.setState({ isShowModal: true, modalQuery: query, currentModal });
          break;
        case "listModal":
          let raw1 = btnInfo.modalQuery;
          if (this.query.embed && btnInfo.embedUrl) {
            let a = helper.parseQueryData(this.query.embed);
            if (a) {
              data = Object.assign(data || {}, a);
            }
          }
          for (i in data) {
            raw1 = helper.replaceAll(raw1, "#" + i + "#", data[i]);
          }
          let query1 = JSON.parse(raw1);
          // if (!query1.modalType) query1.modalType = 'form';
          currentModal = ListCtrl;
          this.setState({
            isShowModal: true,
            modalQuery: query1,
            currentModal
          });
          break;

        default:
          break;
      }
    } catch (err) {
      helper.alert(err.message || "Có lỗi xảy ra!");
    }
  }
  createColumnsData(pageInfo) {
    if (!pageInfo) return;
    let columns = [];
    for (var i = 0; i < pageInfo.grid.length; i++) {
      let gridInfo = pageInfo.grid[i];
      let item = {
        Header: gridInfo.name,
        accessor: gridInfo.field,
        filterable: gridInfo.filterable || false,
        foldable: true,

        Cell: row => {
          return <span className={`text-${gridInfo.color}`}>{row.value}</span>;
        }
      };
      if (gridInfo.enumable) {
        if (gridInfo.items && gridInfo.items.length > 0) {
          if (gridInfo.bindButton) {
            item.Cell = row => {
              let buttons = [];
              for (var i = 0; i < pageInfo.buttons.length; i++) {
                let btn = pageInfo.buttons[i];
                if (btn.column === gridInfo.field) {
                  for (let j = 0; j < gridInfo.items.length; j++) {
                    if (gridInfo.items[j].value == row.value + "") {
                      btn.title = gridInfo.items[j].key;
                      break;
                    }
                  }

                  let a = this.renderBtn(btn, i, row);
                  if (a) {
                    buttons.push(a);
                  }
                }
              }
              return buttons;
            };
          } else {
            item.Cell = row => {
              for (var i = 0; i < gridInfo.items.length; i++) {
                if (gridInfo.type === "boolean") {
                  if (
                    (gridInfo.items[i].value === 1 && row.value) ||
                    (gridInfo.items[i].value === 0 && !row.value)
                  ) {
                    return (
                      <span className={`text-${gridInfo.color}`}>
                        {gridInfo.items[i].key}
                      </span>
                    );
                  }
                } else {
                  if (gridInfo.items[i].value == row.value + "") {
                    return (
                      <span className={`text-${gridInfo.color}`}>
                        {gridInfo.items[i].key}
                      </span>
                    );
                  }
                }
              }
            };
          }

          item.Filter = ({ filter, onChange }) => {
            let val = filter ? filter.value : "";
            return (
              <Input
                value={val}
                type="select"
                onChange={evt => {
                  onChange(evt.target.value);
                }}
              >
                <option key={-1} value={""}>
                  All
                </option>
                {gridInfo.items.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.key}
                  </option>
                ))}
              </Input>
            );
          };
        } else {
          item.Cell = () => {
            return <span className={`text-danger`}>CHƯA CÓ DANH SÁCH</span>;
          };
        }
      } else if (gridInfo.modelSelect) {
        let filt = {};
        if (this.state.tbl && this.state.tbl.filtered) {
          filt = this.calculateFilter(this.state.tbl.filtered);
        }
        item.Filter = ({ filter, onChange }) => {
          return (
            <Widgets.ArrayModel
              value={filter ? filter.value : []}
              onChange={val => {
                setTimeout(() => {
                  onChange(val);
                }, 1);
              }}
              data={filt}
              schema={{
                modelSelectField: gridInfo.modelSelectField || "id,name$$Tên",
                select: gridInfo.select || "name",
                pageId: this.state.pageInfo.id,
                api: gridInfo.modelSelectApi,
                hiddenWhere: gridInfo.hiddenWhere,
                allowByPassHiddenWhere: gridInfo.allowByPassHiddenWhere || false
              }}
            />
          );
        };

        item.Cell = row => {
          if (this.state.modelSelect[gridInfo.field]) {
            for (
              var i = 0;
              i < this.state.modelSelect[gridInfo.field].length;
              i++
            ) {
              if (this.state.modelSelect[gridInfo.field][i].id == row.value) {
                return (
                  <span className={`text-${gridInfo.color}`}>
                    {
                      this.state.modelSelect[gridInfo.field][i][
                        gridInfo.select || "name"
                      ]
                    }
                  </span>
                );
              }
            }
          }
          return <span className={`text-${gridInfo.color}`}>{row.value}</span>;
        };
      } else if (gridInfo.arraySelect) {
        let filt = {};
        if (this.state.tbl && this.state.tbl.filtered) {
          filt = this.calculateFilter(this.state.tbl.filtered);
        }
        item.Filter = ({ filter, onChange }) => {
          return (
            <Widgets.SingleModel
              value={filter ? filter.value : ""}
              onChange={val => {
                onChange(val);
              }}
              data={filt}
              schema={{
                modelSelectField: gridInfo.modelSelectField || "id,name$$Tên",
                select: gridInfo.select || "name",
                pageId: this.state.pageInfo.id,
                api: gridInfo.modelSelectApi,
                hiddenWhere: gridInfo.hiddenWhere,
                allowByPassHiddenWhere: gridInfo.allowByPassHiddenWhere || false
              }}
            />
          );
        };

        if (!this.state.arraySelect[gridInfo.field]) {
          item.Cell = row => {
            return (
              <span className={`text-${gridInfo.color}`}>{row.value}</span>
            );
          };
        } else {
          item.Cell = row => {
            let value = "";
            for (
              var i = 0;
              i < (this.state.arraySelect[gridInfo.field] || []).length;
              i++
            ) {
              let tmp =
                gridInfo.type === "string"
                  ? "" + this.state.arraySelect[gridInfo.field][i].id
                  : +this.state.arraySelect[gridInfo.field][i].id;
              if (row.value.includes(tmp)) {
                if (value) {
                  value += ", ";
                }
                value +=
                  this.state.arraySelect[gridInfo.field][i][
                    gridInfo.select || "name"
                  ] || `{id:${this.state.arraySelect[gridInfo.field][i].id}}`;
              }
            }
            return <span className={`text-${gridInfo.color}`}>{value}</span>;
          };
        }
      } else {
        switch (gridInfo.type) {
          case "date":
            if (gridInfo.filterRange) {
              item.Filter = ({ filter, onChange }) => {
                return (
                  <Row>
                    <Col style={{ paddingRight: "0px" }}>
                      <Widgets.Date
                        value={filter ? filter.value[0] : null}
                        schema={{ disabled: false, placeholder: "Từ" }}
                        onChange={val => {
                          let arr = [];
                          if (filter && filter.value) arr = filter.value;
                          arr[0] = val;
                          onChange(arr);
                        }}
                      />
                    </Col>
                    <Col style={{ paddingLeft: "1px" }}>
                      <Widgets.Date
                        value={filter && filter.value ? filter.value[1] : null}
                        schema={{ disabled: false, placeholder: "Đến" }}
                        onChange={val => {
                          let arr = [];
                          if (filter && filter.value) arr = filter.value;
                          arr[1] = val;
                          onChange(arr);
                        }}
                      />
                    </Col>
                  </Row>
                );
              };
            } else {
              item.Filter = ({ filter, onChange }) => {
                return (
                  <Widgets.Date
                    value={filter ? filter.value : null}
                    schema={{ disabled: false }}
                    onChange={val => {
                      onChange(val);
                    }}
                  />
                );
              };
            }
            item.Cell = row => {
              return (
                <span className={`text-${gridInfo.color}`}>
                  <Moment format="DD/MM/YYYY HH:mm:ss">{row.value}</Moment>
                </span>
              );
            };
            break;
          case "number":
            if (gridInfo.filterRange) {
              item.Filter = ({ filter, onChange }) => {
                return (
                  <Row>
                    <Col style={{ paddingRight: "0px" }}>
                      <Input
                        type="text"
                        value={filter && filter.value ? filter.value[0] : []}
                        onChange={evt => {
                          let arr = [];
                          if (filter && filter.value) arr = filter.value;
                          if (
                            evt.target.value !== null &&
                            evt.target.value !== ""
                          ) {
                            arr[0] = evt.target.value;
                          } else {
                            arr[0] = null;
                          }
                          onChange(arr);
                        }}
                        placeholder="Từ"
                      />
                    </Col>
                    <Col style={{ paddingLeft: "1px" }}>
                      <Input
                        type="text"
                        value={filter && filter.value ? filter.value[1] : []}
                        onChange={evt => {
                          let arr = [];
                          if (filter && filter.value) arr = filter.value;
                          if (
                            evt.target.value !== null &&
                            evt.target.value !== ""
                          ) {
                            arr[1] = evt.target.value;
                          } else {
                            arr[1] = null;
                          }
                          onChange(arr);
                        }}
                        placeholder="Đến"
                      />
                    </Col>
                  </Row>
                );
              };
            }

            item.Cell = row => {
              let value = row.value === 0 ? 0 : row.value || "";
              if (gridInfo.formatNumber) {
                value = value.toLocaleString();
              }
              return <span className={`text-${gridInfo.color}`}>{value}</span>;
            };
            break;
          case "string":
            switch (gridInfo.display) {
              case "image":
                item.Cell = row => {
                  if (_.isArray(row.value)) {
                    return (
                      <ImageViewer
                        images={row.value}
                        className="list-item-img"
                      />
                    );
                  } else {
                    return (
                      <ImageViewer
                        images={[row.value]}
                        className="list-item-img"
                      />
                    );
                  }
                };
                break;
              case "progressbar":
                item.Cell = row => {
                  let colorIndex = Math.floor(row.value / 25);
                  if (colorIndex > 3) {
                    colorIndex = 3;
                  }
                  if (gridInfo.reverseColor) {
                    colorIndex = 3 - colorIndex;
                  }
                  return (
                    <Progress
                      animated
                      color={PROGRESS_COLORS[colorIndex]}
                      value={row.value}
                    >
                      <span className={row.value === 0 ? `text-primary` : ""}>
                        {row.value}%
                      </span>
                    </Progress>
                  );
                };
                break;
              default:
                item.Cell = row => (
                  <span className={`text-${gridInfo.color}`}>
                    {row.value && typeof row.value === "object"
                      ? JSON.stringify(row.value)
                      : row.value}
                  </span>
                );
                break;
            }
            break;
          default:
            break;
        }
      }

      columns.push(item);
    }
    if (pageInfo.buttons && pageInfo.buttons.length > 0) {
      let buttons = [],
        nCha = 0,
        countButton = 0;
      pageInfo.buttons.map(i => {
        if (i.type === "button" && !i.column) {
          nCha += !this.state.hideButton ? i.title.length * 10 : 45;
          countButton++;
          return buttons.push(i);
        }
        return null;
      });
      if (!this.state.hideButton) {
        nCha += 52;
        if (nCha < 200) {
          nCha = 200;
        }
      }

      let col = {
        Header: () => (
          <div
            style={{
              textAlign: "center"
            }}
          >
            Hành động
          </div>
        ),
        accessor: "id",
        filterable: true,
        width: nCha > 90 ? nCha : 90,
        Cell: row => {
          return (
            <div>
              {buttons.map((item, index) => {
                if (item.column) return null;
                return this.renderBtn(item, index, row);
              })}
            </div>
          );
        },
        Filter: () => {
          return (
            <React.Fragment>
              <Button
                style={{ width: "50%" }}
                color="danger"
                className={`mr-1`}
                outline
                onClick={() => {
                  this.init(this.props);
                }}
                data-toggle="tooltip"
                title="Bỏ lọc"
              >
                <i className="fa fa-remove">
                  {this.state.hideButton ? "" : "Bỏ lọc"}
                </i>
              </Button>
              <Button
                style={{ width: "50%" }}
                data-toggle="tooltip"
                title={this.state.hideButton ? "Mở rộng" : "Thu gọn"}
                color="primary"
                className={`mr-1`}
                outline
                onClick={() => {
                  this.setState({ hideButton: !this.state.hideButton }, () => {
                    // this.fetchData(this.state.tbl);
                    this.createColumnsData(this.state.pageInfo);
                    local.set("isHideButton", this.state.hideButton);
                  });
                }}
              >
                {this.state.hideButton ? "<<" : "Thu gọn >"}
              </Button>
            </React.Fragment>
          );
        }
      };
      if (this.state.width >= 600) {
        col.fixed = "right";
      }
      columns.push(col);
      // }
    }
    this.setState({ columns });
  }
  async onSwitch(btnInfo, row, val) {
    // console.log('on switch');
    try {
      await helper.callPageApi(this.state.pageInfo, btnInfo.api, {
        id: row.original.id,
        [btnInfo.column]: val
      });
    } catch (err) {
      console.error(err);
    }
  }
  renderBtn(item, index, row) {
    let disabled = "";
    if (
      item.hideExpression &&
      helper.checkHideExpression(item.hideExpression, row.original)
    ) {
      // return null;
      disabled = "disabled";
      if (item.column) {
        return null;
      }
    }
    if (item.showOnFormOnly) {
      return null;
    }

    // console.log({item})

    switch (item.type) {
      case "switch":
        return (
          <Widgets.Checkbox
            key={index}
            value={row.value}
            onChange={evt => {
              if (row.value !== undefined) this.onSwitch(item, row, evt);
            }}
          />
        );
      default:
        switch (item.action) {
          case "url":
            let url = item.url.replace("$", row.value);
            for (var i in row.original) {
              url = helper.replaceAll(url, "#" + i + "#", row.original[i]);
            }
            for (i in this.query) {
              url = helper.replaceAll(url, "@" + i + "@", this.query[i]);
            }
            return (
              <a
                key={index}
                href={url}
                data-toggle="tooltip"
                title={item.title || ""}
                className={`btn btn-${item.color} mr-1 ${disabled}`}
                target={item.target || "_self"}
              >
                <i className={item.icon || "fa fa-check"} />{" "}
                {!this.state.hideButton ? item.title : ""}
              </a>
            );
          case "api":
          case "formModal":
          case "listModal":
            return (
              <Button
                key={index}
                disabled={!!disabled}
                data-toggle="tooltip"
                title={item.title || ""}
                className={`mr-1`}
                color={item.color}
                outline={item.outline || false}
                onClick={() => {
                  this.onButtonClick(item, row.original);
                }}
              >
                <i className={item.icon || "fa fa-check"} />{" "}
                {!this.state.hideButton ? item.title : ""}
              </Button>
            );
          case "report":
            return (
              <Button
                key={index}
                disabled={!!disabled}
                data-toggle="tooltip"
                title={item.title || ""}
                className={`pull-right`}
                type="button"
                color={item.color}
                outline={item.outline || false}
                onClick={() => {
                  this.onReportClick(item, null);
                }}
              >
                <i className={item.icon || "fa fa-check"} />{" "}
                {!this.state.hideButton ? item.title : ""}
              </Button>
            );
          case "disable":
            return (
              <Button
                key={index}
                disabled={true}
                data-toggle="tooltip"
                title={item.title || ""}
                className={`mr-1`}
                color={item.color}
                outline={item.outline || false}
              >
                <i className={item.icon || "fa fa-check"} />{" "}
                {!this.state.hideButton ? item.title : ""}
              </Button>
            );
          default:
            return null;
        }
    }
  }
  onReportClick(btn) {
    let submitData = Object.assign({}, this.state.currentFilter);

    if (btn.apiData) {
      try {
        let tmpApiData = JSON.parse(btn.apiData);
        for (const key in tmpApiData) {
          if (tmpApiData.hasOwnProperty(key)) {
            const e = tmpApiData[key];
            submitData[key] = helper.getFieldReferValue(
              e,
              this.state.currentFilter
            );
          }
        }
      } catch (error) {
        return helper.toastError("Oops, Something went wrong!");
      }
    }
    helper
      .report(
        this.state.pageInfo,
        btn.api,
        submitData,
        btn.reportName || "report"
      )
      .then(console.log)
      .catch(console.error);
    // window.open(config.host + url, '_blank');
  }
  render() {
    if (this.state.error)
      return <p className="text-danger">{this.state.error}</p>;
    if (!this.state.pageInfo) return <Loader />;
    if (this.firstLoad && this.state.height <= 623) {
      this.state.itemsPerPage = 5;
      this.firstLoad = false;
    }
    return (
      <Row>
        <Col md="12">
          <Modal
            isOpen={this.state.isShowModal}
            fade={false}
            size={"lg"}
            backdrop={false}
            toggle={() => {
              this.fetchData(this.state.tbl);
              this.setState({ isShowModal: false });
            }}
          >
            <ModalBody>
              {this.state.currentModal && this.state.isShowModal ? (
                <this.state.currentModal
                  query={this.state.modalQuery}
                  openType="modal"
                  closeModal={this.closeModal.bind(this)}
                />
              ) : (
                <Loader />
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => {
                  this.closeModal();
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
          <CardGroup>
            <Card>
              <CardHeader>
                <div className="pull-left">
                  <h3 className="mb-0">
                    {this.query.name
                      ? this.query.name
                      : this.state.pageInfo.name}
                  </h3>
                  <p className="small text-muted m-0">
                    Tổng cộng: {this.state.count} bản ghi
                  </p>
                </div>
                <div className="pull-right">
                  {this.state.pageInfo.buttons.map((item, index) => {
                    if (item.type !== "submit") return null;
                    return this.renderBtn(item, index, {});
                  })}
                </div>
              </CardHeader>
              <CardBody>
                <ReactTableFixedColumns
                  ref="table"
                  previousText={"Trước"}
                  nextText={"Sau"}
                  pageText={"Trang"}
                  rowsText={"Bản ghi"}
                  ofText={"/ "}
                  data={this.state.data}
                  loading={this.state.loading}
                  manual
                  showPageJump={true}
                  // filterable
                  onFilteredChange={(filtered, column, value) => {
                    this.lastFilterChange = moment().valueOf();
                    // this.onFilteredChangeCustom(value, column.id || column.accessor);
                  }}
                  onFetchData={this.fetchData.bind(this)}
                  pages={this.state.nPage}
                  columns={this.state.columns}
                  defaultPageSize={this.state.itemsPerPage}
                  className="-striped -highlight data-table"
                  loadingText={"Đang tải dữ liệu..."}
                  getTrProps={(state, rowInfo, column) => {
                    if (
                      this.state.pageInfo.additionalGrid.highlight &&
                      rowInfo &&
                      helper.checkHideExpression(
                        this.state.pageInfo.additionalGrid.highlightExpression,
                        (rowInfo || {}).original || {}
                      )
                    ) {
                      return {
                        style: {
                          color:
                            this.state.pageInfo.additionalGrid.highlightColor ||
                            "red"
                        }
                      };
                    } else {
                      return {};
                    }
                  }}
                />
              </CardBody>
            </Card>
          </CardGroup>
        </Col>
      </Row>
    );
  }
}
export default ListCtrl;
