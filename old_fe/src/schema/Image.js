import React, { Component } from 'react';
import {
    Input, CustomInput
} from 'reactstrap';
import qs from 'qs';
import request from '../services/request';
import ImageViewer from "./ImageViewer";
import helper from '../services/helper';
class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: props.schema,
            width: props.schema.imageWidth,
            height: props.schema.imageHeight
        }
    }
    async uploadFile(file) {
        let formData = new FormData();
        // console.log({ file })
        if (!file.type.toLowerCase().startsWith('image')) {
            return helper.alert('File not allow!')
        }
        formData.append('images', file);
        let queryInput = {};
        let url = '';
        if (this.state.width && this.state.height) {
            queryInput.width = this.state.width;
            queryInput.height = this.state.height
            queryInput.isToJPG = 1;
            url = `/api/file/upload-image?${qs.stringify(queryInput)}`;
        } else {
            queryInput.isToJPG = 1;
            url = `/api/file/upload-image`;
        }
        let rs = await request.upload(url, formData);
        if (this.props.onChange) {
            this.props.onChange(rs.created[0].url);
        }
    }
    render() {
        return (<div>
            {/* hiển thị ảnh thumbnail */}
            {this.props.value ? (
                <ImageViewer value={[this.props.value]} />
                // <img src={this.props.value} className='file-picker-thumbnail' alt={'Hình ảnh'} />
            ) : null}
            <Input type="file"
                // inputProps={{ accept: 'image/*' }}
                disabled={this.props.disabled}
                onChange={evt => {
                    this.uploadFile(evt.target.files[0]);
                }} />
        </div>
        )
    }
}

export default Image;