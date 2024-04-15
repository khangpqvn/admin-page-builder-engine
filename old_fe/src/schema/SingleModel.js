import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactTable from "react-table";
import {
    Button,
    Input,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import helper from '../services/helper';
import Checkbox from './Checkbox';
import _ from 'lodash'
class SingleModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
            modal: false,
            data: [],
            loading: true,
            search: '',
            pageId: props.schema.pageId,
            schema: props.schema,
            count: 0,
            columns: this.calculateColumns(props.schema),
            nPages: 0,
            display: null,
            mode: 'select'
        };
        this.display = '';
        this.value = this.props.value;
        this.data = _.cloneDeep(this.state.data);
        this.init(props.schema.pageId, props);
    }
    itemsPerPage = 10;
    pageInfo = null;
    schema = null;
    hiddenWhere = [];
    hiddenWhereDepend = [];
    formData = {};
    componentWillReceiveProps(next) {
        if (this.props.value !== next.value) {
            this.setState({ value: next.value });
            this.fetchItemName(this.pageInfo, this.schema, next.value);
        }

        for (let i = 0; i < this.hiddenWhereDepend.length; i++) {
            const e = this.hiddenWhereDepend[i];
            if (next.data && (this.formData[e] !== next.data[e] || (Array.isArray(next.data[e]) && !_.isEqual(this.formData[e].sort(), next.data[e].sort())))) {
                this.formData = Object.assign({}, next.data);
                let value = '';
                let data = this.calculateCheck(this.state.data, this.schema, value);
                this.setState({ data, value: null });
                this.onChange(value)
                return;
            }
        }


    }
    async init(pageId, props) {
        this.pageInfo = await helper.getPage(pageId);
        this.schema = props.schema;
        this.fetchItemName(this.pageInfo, this.schema, props.value);
        this.formData = Object.assign({}, props.data || {});
        this.hiddenWhere = props.schema.hiddenWhere || [];
        this.hiddenWhereDepend = [];

        (props.schema.hiddenWhere || []).map(v => {
            let tmpV = '';
            try {
                tmpV = JSON.parse(v.value);
            } catch (error) {
                tmpV = v.value;
            }
            if (typeof tmpV === 'string') {
                let tmp = tmpV.split('this.');
                if (tmp.length === 2) {
                    this.hiddenWhereDepend.push(tmp[1]);
                }
            }
        })
    }

    toggle(mode) {
        // console.log({ mode })
        this.setState({
            mode,
            modal: !this.state.modal
        });
    }

    calculateSelectField(modelSelectField) {
        return [...new Set(
            modelSelectField.split(',').map(v => v.split('$$')[0])
            // .concat((this.props.schema.hiddenField || '').split(','))
        )].join(',');
    }

    getFilterFromHiddenWhere(allowByPassHiddenWhere) {
        let ret = {};
        (this.hiddenWhere || []).map(v => {
            let tmpV = '';
            try {
                tmpV = JSON.parse(v.value);
            } catch (error) {
                tmpV = v.value;
            }
            if (typeof tmpV === 'string') {
                let tmp = tmpV.split('this.');
                if (tmp.length === 2) {
                    ret[v.key] = this.formData[tmp[1]] || (allowByPassHiddenWhere ? undefined : [0]);
                } else {
                    ret[v.key] = tmpV;
                }
            } else {
                ret[v.key] = tmpV;
            }
        })
        return ret;
    }
    async fetchData(tbl) {
        let filter = {}, sort = null;
        if (tbl.filtered) {
            tbl.filtered.map(f => {
                switch (f.id) {
                    case 'id':
                        filter.id = (f.value) || "0";
                        break;
                    default:
                        filter[f.id] = { contains: f.value };
                        break;
                }
                return null;
            })
        }
        if (tbl && tbl.sorted) {
            sort = [];
            tbl.sorted.map(s => {
                sort.push({
                    [s.id]: s.desc ? 'desc' : 'asc'
                });
                return null;
            })
        }

        filter = Object.assign({}, filter, this.getFilterFromHiddenWhere(this.schema.allowByPassHiddenWhere));
        if (this.state.mode === 'view') {
            if (filter.id) {
                if (filter.id !== this.props.value) {
                    filter.id = undefined;
                }
            } else {
                filter.id = this.props.value;
            }
        }
        try {
            let rs = await helper.callPageApi(this.pageInfo, this.schema.api, { select: this.calculateSelectField(this.schema.modelSelectField), sort, queryInput: JSON.stringify(filter), limit: tbl.pageSize, skip: tbl.pageSize * tbl.page });
            rs.data = this.calculateCheck(rs.data, this.schema, this.state.value);
            this.setState({ data: rs.data, count: rs.count, loading: false, nPage: Math.ceil(rs.count / tbl.pageSize) })
        } catch (error) {
            console.error(error);
        }
    }
    async fetchItemName(pageInfo, schema, value) {
        if (!pageInfo || !schema || !value) {
            this.display = '';
            this.setState({ display: '' })
            return;
        }
        let filter = {};
        filter.id = value;
        let rs = await helper.callPageApi(pageInfo, schema.api, { queryInput: JSON.stringify(filter), select: schema.select || 'name' });
        this.display = (this.schema.showWithId && rs.data[0] && rs.data[0].id ? "#" + rs.data[0].id + " | " : "") + (rs.data[0] ? (rs.data[0][schema.select] || rs.data[0].name) : '');
        this.setState({ display: this.display });


    }
    calculateCheck(data, schema, value) {
        data.map(d => {
            if (d.id === value) return d.checked = true;
            return d.checked = false;
        });
        return data;
    }

    onChange(e) {
        this.data = _.cloneDeep(this.state.data);
        this.value = e;

        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    onCheckboxChanged(row, e) {
        if (this.props.disabled) return;
        let value = undefined;
        if (e) {
            value = row.row.id;
        }
        let data = this.calculateCheck(this.state.data, this.schema, value);
        this.setState({ data, value });
    }
    calculateColumns(schema) {
        let cols = [];
        let names = (schema.modelSelectField || 'id,name').split(',');
        names.map(n => {
            let arr = n.split('$$');
            let col = {
                Header: arr[1] || n,
                accessor: arr[0],
            }
            if (this.props.disabled) {
                col.filterable = false
            }
            cols.push(col);
            return null;
        })
        if (!this.props.disabled) {
            cols.push({
                Header: 'Select',
                accessor: 'checked',
                filterable: false,
                Cell: row => {
                    let val = false;
                    for (var i = 0; i < this.state.data.length; i++) {
                        if (this.state.data[i].id === row.row.id) {
                            val = this.state.data[i].checked || false;
                        }
                    }
                    return <div>
                        {this.state.mode === 'select' ? <Checkbox value={val} disabled={this.props.disabled} onChange={e => {
                            this.onCheckboxChanged(row, e);
                        }} /> : null}
                    </div>
                }
            })
        }
        return cols;
    }
    confirm() {
        this.data = _.cloneDeep(this.state.data);
        this.value = this.state.value;
        if (this.props.onChange) {
            this.props.onChange(this.state.value)
        }
        this.toggle();
    }
    render() {
        if (this.schema && !this.schema.modelSelectField) return <p>Thiếu dữ liệu modelSelectField</p>
        return (<div>
            <InputGroup onClick={() => {
                this.props.disabled ? this.toggle('view') : this.toggle('select');
            }}  >
                <Input type="text" disabled={true} value={this.state.display || this.state.value || ''} />
                {/* <InputGroupAddon addonType="append">
                    <Button type='button' color="info" onClick={() => { this.toggle('view') }} ><i className='fa fa-search' /></Button>
                </InputGroupAddon> */}
                <InputGroupAddon addonType="append">
                    <Button type='button' color="primary"><i className='fa fa-plus' /></Button>
                </InputGroupAddon>
            </InputGroup>





            <Modal isOpen={this.state.modal} fade={false} size={'lg'}>
                <ModalHeader>Select one</ModalHeader>
                <ModalBody>
                    <ReactTable
                        previousText={'Previous'}
                        nextText={'Next'}
                        pageText={'Page'}
                        rowsText={'Records'}
                        ofText={'/ '}
                        data={this.state.data}
                        loading={this.state.loading}
                        manual
                        filterable
                        onFetchData={this.fetchData.bind(this)}
                        pages={this.state.nPage}
                        columns={this.state.columns}
                        defaultPageSize={this.itemsPerPage}
                        className="-striped -highlight"
                    />
                </ModalBody>
                <ModalFooter>
                    {this.state.mode === 'select' && !this.props.disabled ? <React.Fragment>
                        <Button color="primary mr-1" onClick={this.confirm.bind(this)}>Ok</Button>
                        <Button color="secondary" onClick={() => {
                            this.setState({ data: this.data, value: this.value, display: this.display }, () => {
                                this.toggle();
                            });
                        }}>Cancel</Button>
                    </React.Fragment>
                        : <Button color="secondary" onClick={this.toggle.bind(this)}>Close</Button>}
                </ModalFooter>







            </Modal>
        </div>)
    }
}

export default SingleModel;