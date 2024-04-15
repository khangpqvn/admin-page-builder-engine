import Local from '../../services/local';
import Config from '../../services/config';
import axios from 'axios';
import Helper from '../../services/helper';
let request = {}, cacheData = {};
request.cancelUpload = cancelToken => {
    source.cancel(cancelToken);
}
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
request.getCancelToken = () => {
    return source.token;
}
request.upload = async (url, formData, cancelToken, onProgress) => {
    let rs = await axios.request({
        method: "post",
        url: `${Config.host}${url}`,
        data: formData,
        // timeout: 100000,
        cancelToken,
        headers: {
            'Authorization': `${Local.get('session')}`,
            'api-version': 'sponsors'
        },
        onUploadProgress: (p) => {
            if (onProgress) { onProgress(p) }
            //fileprogress: p.loaded / p.total
            //})
        }
    })
    return rs.data;
}

request.call = async input => {

    try {
        let { url, data, header, method = 'POST', cache } = input;
        url = `${Config.host}${url}`;
        let rs = null;
        if (cache) {
            rs = cacheData[url];
            if (rs) return rs;
        }
        let option = {
            method,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/json',
                'Authorization': `${Local.get('session')}`,
                ...header
            }
        };
        if (method === 'GET') delete option.body;
        console.log(`[${method}]`, url, option, data);
        let res = await fetch(url, option);
        rs = await res.json();
        if (cache) {
            cacheData[url] = rs;
        }
        console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 200:
                return rs;
            case 401:
                let location = window.location;
                Local.clear();
                sessionStorage.setItem('unauthorized', 1)
                if (!(+sessionStorage.getItem('aftersignin'))) {
                  sessionStorage.setItem('lastLocation', location);
                }
                
                window.location.href = '/';
                throw rs;
            default:
                throw rs;
        }

    } catch (err) {
        throw err;
    }
}
export default request;