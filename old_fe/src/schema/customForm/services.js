import request from './request';
import qs from 'query-string';
import Local from '../../services/local';
import config from '../../services/config';
import _ from 'lodash';
let cache = {};
const data_source = 1;
let dt = {};

dt.getCaptcha = () => {
    return request.call({
        header: { 'api-version': 'public' },
        url: `/api/auth/create-captcha`
    });
}


dt.getCategory = filter => {
    return request.call({
        url: `/api/category?${qs.stringify(filter)}`,
        header: { 'api-version': 'find-name' },
        method: 'GET'
    });
}
export default dt;