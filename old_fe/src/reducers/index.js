import { combineReducers } from 'redux';
import userInfo from './user';
import modals from './modals';
export default combineReducers({
    userInfo, modals
});