import React, { Component } from 'react';
import {
    Button
} from 'reactstrap';
import Image from './Image';
import _ from 'lodash';
class ArrayImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: props.schema,
            width: props.schema.imageWidth,
            height: props.schema.imageHeight,
        }
    }
    addImage() {
        if (this.props.onAddClick) {
            return this.props.onAddClick();
        }
        let data = _.clone(this.props.value) || [];
        data.push('');
        if (this.props.onChange) {
            this.props.onChange(data);
        }
    }
    removeImage(index) {
        let data = _.clone(this.props.value) || [];
        data.splice(index, 1);
        if (this.props.onChange) {
            this.props.onChange(data);
        }
    }

    render() {
        return (<div>
            {(this.props.value || [])
                .map((item, index) =>
                    <div className='single-image-container' key={index}>
                        <Image
                            value={item}
                            key={index}
                            schema={this.props.schema}
                            onChange={e => {
                                let data = _.clone(this.props.value) || [];
                                data[index] = e;
                                if (this.props.onChange) {
                                    this.props.onChange(data);
                                }
                            }} />
                        <Button className='btn-remove-image' color='danger' onClick={() => {
                            this.removeImage(index);
                        }}><i className='fa fa-remove'></i></Button>
                    </div>
                )
            }
            <Button color='primary' type='button' onClick={() => { this.addImage(); }}><i className='fa fa-plus' /> Thêm ảnh</Button>
        </div>)
    }
}

export default ArrayImage;