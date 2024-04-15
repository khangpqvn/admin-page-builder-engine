import React, { Component } from 'react';
import '../loading.css';
class Loader extends Component {
    render() {
        return (<div className='loader-container'>
            <div className='loader'>
                <div className="lds-ripple"><div></div><div></div></div>
                <h4>Loading...</h4>
            </div>

        </div>)
    }
}
export default Loader;
