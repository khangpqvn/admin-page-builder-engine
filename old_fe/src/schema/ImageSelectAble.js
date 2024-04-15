import React, { Component } from 'react';
import _ from 'lodash'

let images = []
let value = []
export default class ImageSelectAble extends Component {
    constructor(props) {
        super(props)
        images = props.value.map((v, index) => {
            return { image: v, selected: false }
        })
        value = props.value;
        this.state = {
            images,value
        }
        if (this.props.onChange) {
            this.props.onChange([]);
        }
        this.onPick = this.onPick.bind(this)
    }

    onPick(image, index) {
        images[index] = { image: images[index].image, selected: !images[index].selected }
        let selected = images.filter(v => v.selected).map(v => v.image);
        if (this.props.onChange) {
            this.props.onChange(selected);
        }
        this.setState({ images })
        // console.log({ image, index })

    }
    // componentWillReceiveProps(next) {
    //     if (_.difference(next.value, this.state.value).length || _.difference(this.state.value, next.value).length || next.value.length !== this.state.value.length) {
    //         this.setState({
    //             photoIndex: 0,
    //             isOpen: false,
    //             images: next.value,
    //         })
    //     }
    // }

    render() {
        return (
            this.state.images && this.state.images.length?
            <div >
                <div className='row'>
                    {this.state.images.map((item, index) => <div key={index} className='col-md-4 mb-2'>
                        <img src={item.image} alt={'No image'} className={`img-fluid  img-zoom-on-hover ${item.selected ? 'img-selected' : ''}`} onClick={() => this.onPick(item, index)} />
                        <img src='assets/img/checked.png' className='tick'/>
                    </div>)}
                </div>
            </div>
            :<div>
                 No image
            </div>
        )
    }
}