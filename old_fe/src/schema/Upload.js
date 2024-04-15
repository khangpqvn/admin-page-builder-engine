import React, { Component } from 'react';
import {
    Input
} from 'reactstrap';
import request from '../services/request';
import helper from '../services/helper';
class Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height
        }
    }
    async uploadFile(file) {
        try {
            let formData = new FormData();
            formData.append('files', file);
            let rs = await request.upload(`/api/file/upload-file`, formData);
            if (this.props.onChange) {
                this.props.onChange(rs.created[0].id);
            }
        } catch (err) {
            helper.alert(err.message);
        }
    }
    render() {
        return (<div>
            <Input type="file"
                disabled={this.props.disabled}
                onChange={evt => {
                    this.uploadFile(evt.target.files[0]);
                }} />
        </div>)
    }
}

export default Upload;