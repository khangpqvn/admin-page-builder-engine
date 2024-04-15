import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import App from './App';
import configureStore from './store';
import ModalControl from './controls/ModalControl';
// disable ServiceWorker
// import registerServiceWorker from './registerServiceWorker';
let store = configureStore();
ReactDOM.render(<Provider store={store}>
    <React.Fragment>
        <ModalControl />
        <App />
    </React.Fragment>
</Provider>, document.getElementById('root'));
// disable ServiceWorker
// registerServiceWorker();

