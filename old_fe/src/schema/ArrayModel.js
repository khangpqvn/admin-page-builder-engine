import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactTable from "react-table";
import {
    Button,
    InputGroup,
    InputGroupAddon,
    ButtonGroup
} from 'reactstrap';
import helper from '../services/helper';
import Checkbox from './Checkbox';
import _ from 'lodash';
class ArrayModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            data: [],
            names: [],
            loading: true,
            search: '',
            pageId: props.schema.pageId,
            schema: props.schema,
            count: 0,
            columns: this.calculateColumns(props.schema),
            output: _.clone(props.value || []),
            nPages: 0,
            display: null,
            mode: 'select'
        };
        this.data = [];
        this.output = _.clone(props.value || []);
        this.names = []
        this.init(props.schema.pageId, props.schema, _.clone(props.value || []));
    }
    itemsPerPage = 10;
    pageInfo = null;
    hiddenWhere = [];
    hiddenWhereDepend = [];
    formData = {}
    remove = false;


    componentWillReceiveProps(next) {
        for (let i = 0; i < this.hiddenWhereDepend.length; i++) {
            const e = this.hiddenWhereDepend[i];
            if (next.data && (this.formData[e] !== next.data[e] || (Array.isArray(next.data[e]) && !_.isEqual(this.formData[e].sort(), next.data[e].sort())))) {
                this.formData = Object.assign({}, next.data);
                this.setState({ names: [], output: [] });
                this.onChange([]);
                this.fetchItemName(this.pageInfo, this.state.schema, this.state.output);
                break;
            }
        }
        if (!next.value) {
            return this.setState({ names: [], output: [] });
        }
        if (!_.isEqual(this.state.output, next.value)) {
            this.fetchItemName(this.pageInfo, this.state.schema, next.value);
        }
        this.setState({ output: _.clone(next.value) });
    }
    async init(pageId, schema, output) {
        this.pageInfo = await helper.getPage(pageId);
        this.fetchItemName(this.pageInfo, schema, output);
        this.formData = Object.assign({}, this.props.data || {});
        this.hiddenWhere = schema.hiddenWhere || [];
        this.hiddenWhereDepend = [];

        (schema.hiddenWhere || []).map(v => {
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

    toggle(mode) {
        this.setState({
            mode,
            modal: !this.state.modal
        });
    }
    calculateSelectField(modelSelectField) {
        return modelSelectField.split(',').map(v => v.split('$$')[0]).join(',');
    }

    async fetchData(tbl) {
        let filter = {}, sort = null;
        if (tbl.filtered) {
            tbl.filtered.map(f => {
                switch (f.id) {
                    case 'id':
                        filter.id = f.value || "0";
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
        if (this.state.mode === 'view') {
            if (filter.id) {
                if (!_.includes(this.state.output, filter.id)) {
                    filter.id = 0;
                }
            } else {
                filter.id = this.state.output;
            }
        }
        try {
            filter = Object.assign({}, filter, this.getFilterFromHiddenWhere(this.state.schema.allowByPassHiddenWhere));
            let rs = await helper.callPageApi(this.pageInfo, this.state.schema.api, { select: this.calculateSelectField(this.state.schema.modelSelectField), sort, queryInput: JSON.stringify(filter), limit: tbl.pageSize, skip: tbl.pageSize * tbl.page });
            rs.data = this.calculateCheck(rs.data, this.state.output);
            this.setState({ data: rs.data, count: rs.count, loading: false, nPage: Math.ceil(rs.count / tbl.pageSize) })
        } catch (err) {
            console.error(err);
        }
    }
    async fetchItemName(pageInfo, schema, output) {
        if (!pageInfo || !schema || !output) return;
        let filter = {};
        filter.id = output;
        try {
            let rs = await helper.callPageApi(pageInfo, schema.api, { queryInput: JSON.stringify(filter), select: schema.select || 'name' });
            let display = [];
            rs.data.map(d => {
                return display.push(d[schema.select] || d.name);
            });
            this.names = _.cloneDeep(rs.data);
            this.setState({ names: rs.data, display: _.join(display, '-') });
        } catch (err) {
            console.error(err);
        }
    }
    calculateCheck(data, output) {
        data.map(d => {
            if (_.includes(output, d.id)) return d.checked = true;
            return d.checked = false;
        });
        return data;
    }

    onCheckboxChanged(row, e) {
        if (this.props.disabled) return;
        let output = this.state.output.splice(0);
        if (e) {
            if (!_.includes(output, row.row.id)) output.push(row.row.id);
        } else {
            let tmp = [];
            output.map(o => {
                if (o !== row.row.id) {
                    tmp.push(o);
                }
                return null;
            });
            output = tmp;
        }

        let data = this.calculateCheck(this.state.data, output);
        this.setState({ data, output });
    }
    calculateColumns(schema) {
        let cols = [];
        let names = schema.modelSelectField.split(',');
        names.map(n => {
            let arr = n.split('$$');
            cols.push({
                Header: arr[1] || n,
                accessor: arr[0],
            });
            return null;
        })
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
        return cols;
    }
    confirm() {
        this.onChange(this.state.output);
       
        this.fetchItemName(this.pageInfo, this.state.schema, this.state.output);
        this.toggle();
    }
    onChange(dt) {
        this.output = _.cloneDeep(dt);
        if (this.props.onChange) {
            this.props.onChange(dt);
        }
    }
    onRemoveClick(id) {
        this.remove = true;
        if (this.props.disabled) return;
        let output = [], names = [];
        for (var i = 0; i < this.state.names.length; i++) {
            if (this.state.names[i].id !== id) {
                output.push(this.state.names[i].id);
                names.push(this.state.names[i]);
            }
        }
        this.setState({ output, names });
        this.names = _.cloneDeep(names);

        this.onChange(output);
    }
    render() {
        return (<div>
            <InputGroup>
                <div className='form-control select-container' onClick={() => {
                    setTimeout(() => {
                        if (!this.remove) {
                            this.props.disabled ? this.toggle('view') : this.toggle('select');
                        }
                        this.remove = false;
                    }, 100);
                }} >
                    {this.state.names.map((item, index) => {
                        return item ? <ButtonGroup size='sm' key={index} className='mr-2 select-item'>
                            <Button color='danger' disabled={this.props.disabled} type='button' size='sm' onClick={() => { this.onRemoveClick(item.id) }}><i className='fa fa-remove' /></Button>
                            <Button color='default' type='button' size='sm'>{item.name}</Button>
                        </ButtonGroup> : null
                    }
                    )}
                </div>

                <InputGroupAddon addonType="append" >
                    <Button type='button' color="primary" onClick={() => { this.props.disabled ? this.toggle('view') : this.toggle('select'); }}><i className='fa fa-plus' /></Button>
                </InputGroupAddon>
                {/* <InputGroupAddon addonType="append" >
                    <Button type='button' color="primary" onClick={() => { this.toggle('view') }}><i className='fa fa-plus' /></Button>
                </InputGroupAddon> */}
            </InputGroup>
            <Modal isOpen={this.state.modal} fade={false} size={'lg'}>
                <ModalHeader>Select one or many</ModalHeader>
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
                        <Button color="primary mr-1" onClick={this.confirm.bind(this)}>Confirm</Button>
                        <Button color="secondary" onClick={() => { this.setState({ data: this.data, names: this.names,output:this.output }); this.toggle(); }}>Cancel</Button>
                    </React.Fragment>
                        : <Button color="secondary" onClick={this.toggle.bind(this)}>Close</Button>}
                </ModalFooter>
            </Modal>
        </div>)
    }
}

export default ArrayModel;