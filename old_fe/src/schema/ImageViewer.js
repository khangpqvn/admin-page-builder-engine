import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import _ from 'lodash'
export default class ImageViewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photoIndex: 0,
            isOpen: false,
            images: props.value,
        };
    }
    componentWillReceiveProps(next) {
        if (_.difference(next.value, this.state.images).length || _.difference(this.state.images, next.value).length || next.value.length !== this.state.images.length) {
            this.setState({
                photoIndex: 0,
                isOpen: false,
                images: next.value,
            })
        }
    }

    render() {
        const { photoIndex, isOpen } = this.state;
        // if (this.state.images.length === 1) {
        //     return (
        //         <div>
        //             <img src={this.state.images[0]} alt={'...'} className='img-fluid img-hover-opacity' onClick={() => this.setState({ isOpen: true })} />
        //             {isOpen && (
        //                 <Lightbox
        //                     mainSrc={this.state.images[photoIndex]}
        //                     onCloseRequest={() => this.setState({ isOpen: false })}
        //                 />
        //             )}
        //         </div>
        //     );
        // }
        return (
            this.state.images && this.state.images.length ?


                <div>
                    <div className='row'>
                        {this.state.images.map((item, index) => <div key={index} className='col-md-4 mb-2'>

                            <img src={item} alt={'No image'} className='img-fluid img-hover-opacity' onClick={() => this.setState({ isOpen: true, photoIndex: index })} />
                        </div>)}
                    </div>

                    {isOpen && (
                        <Lightbox
                            mainSrc={this.state.images[photoIndex]}
                            nextSrc={this.state.images[(photoIndex + 1) % this.state.images.length]}
                            prevSrc={this.state.images[(photoIndex + this.state.images.length - 1) % this.state.images.length]}
                            onCloseRequest={() => this.setState({ isOpen: false, photoIndex: 0 })}
                            onMovePrevRequest={() =>
                                this.setState({
                                    photoIndex: (photoIndex + this.state.images.length - 1) % this.state.images.length,
                                })
                            }
                            onMoveNextRequest={() =>
                                this.setState({
                                    photoIndex: (photoIndex + 1) % this.state.images.length,
                                })
                            }
                        />
                    )}
                </div> : <div>
                    No image
            </div>
        );
    }
}