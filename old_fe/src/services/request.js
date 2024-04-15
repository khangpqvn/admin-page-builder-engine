import Local from './local';
import Config from './config';
import Helper from './helper';
import socketIOClient from 'socket.io-client';
import sailsIOClient from 'sails.io.js';
import axios from 'axios';
import moment from "moment";

// Instantiate the socket client (`io`)
// (for now, you must explicitly pass in the socket.io client when using this library from Node.js)
var io = sailsIOClient(socketIOClient);

io.sails.url = Config.host;
io.sails.autoConnect = true;
io.socket.on('connect', () => {
  console.log('connect success');

})

io.socket.on('disconnect', function () {
  console.log('disconnect');
});

io.socket.on("reconnecting", (numAttempts) => {
  console.log('reconnecting: numAttempts=>', numAttempts);
})
io.socket.on("reconnect", (transport, numAttempts) => {
  console.log('reconnect: numAttempts=>', numAttempts, { transport });
})

let request = {};
request.upload = async (url, formData) => {
  url = `${Config.host}${url}`
  let option = {
    method: 'POST', // or 'PUT'
    body: formData,
    headers: {
      'api-version': 'admin',
      'Authorization': `${Local.get('session') || 'customer'}`
    }
  };
  if (Config.debug) console.log(`[POST]`, url, option);
  let res = await fetch(url, option);
  let rs = { message: 'Upload file fail' };
  if (res.status !== 200) {
    if (res.json) {
      rs = res.json()
    }
    throw rs;
  }
  rs = await res.json();

  if (Config.debug) console.log(`[RESPONSE]`, url, rs);
  return rs;
}
request.request = async (url, data, headers, method = 'POST') => {
  url = `${Config.host}${url}`;
  let option = {
    method, // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers: {
      'api-version': 'pageid',
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': `${Local.get('session') || 'customer'}`
    }
  };
  option.headers = Object.assign({}, option.headers, headers);
  if (method === 'GET') delete option.body;

  if (Config.debug) console.log(`[${method}]`, url, option);

  let res = await fetch(url, option);
  try {
    let rs = await res.json();
    if (Config.debug) console.log(`[RESPONSE]`, url, rs);
    switch (res.status) {
      case 401:
        let location = window.location;
        Local.clear();
        sessionStorage.setItem('unauthorized', 1)
        if (!(+sessionStorage.getItem('aftersignin'))) {
          sessionStorage.setItem('lastLocation', location);
        }
        window.location.href = '/';
        throw rs;
      case 200:
        return rs;
      default:
        throw rs;
    }

  } catch (err) {
    console.log('res', res, err);
    throw err;
  }

}

request.download = async (url, apiVersion) => {
  url = `${Config.host}${url}`
  let option = {
    method: 'GET', // or 'PUT'
    // body: formData,
    headers: {
      'api-version': apiVersion || 'admin',
      'Authorization': `${Local.get('session') || 'customer'}`
      //'Content-Type':'application/octet-stream'
    }
  };
  if (Config.debug) console.log(`[GET]`, url, option);
  let res = await fetch(url, option);
  //let rs = await res.json();
  if (res.status !== 200) {
    console.log(res);
    //throw rs;
  }
  if (Config.debug) console.log(`[RESPONSE]`, url, res);
  return res;
}
request.downloadAttachment = async (url, filename, apiVersion = "pageid") => {
  let response = await request.download(url, apiVersion);
  response.blob().then(blob => {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  });
}
request.ioRequest = async (url, data, headers, method = 'POST') => {
  url = `${Config.host}${url}`;
  let option = {
    url,
    method, // or 'PUT'
    data,
    headers: {
      'api-version': 'pageid',
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': `${Local.get('session') || 'customer'}`
    }
  };
  option.headers = Object.assign({}, option.headers, headers);
  // if (method === 'GET') delete option.data;

  if (Config.debug) console.log(`[${method}]`, url, option);
  let res = await new Promise((resolve, reject) => {
    io.socket.request(option, function (resData, jwres) {
      resolve(jwres)
    });
  })

  try {
    let rs = await res.body;
    if (Config.debug) console.log(`[RESPONSE]`, url, rs);
    switch (res.statusCode) {
      case 401:
        let location = window.location;
        Local.clear();
        sessionStorage.setItem('unauthorized', 1)
        if (!(+sessionStorage.getItem('aftersignin'))) {
          sessionStorage.setItem('lastLocation', location);
        }
        window.location.href = '/';
        throw rs;
      case 200:
        return rs;
      default:
        throw rs;
    }

  } catch (err) {
    console.log('res', res, err);
    throw err;
  }

}
request.report = async (url, reportName, data = {}, headers = {}, method = 'GET') => {
  url = `${Config.host}${url}`
  let option = {
    method, // or 'PUT'
    responseType: 'blob', // important
    body: (data), // data can be `string` or {object}!
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${Local.get('session') || 'customer'}`,
      'api-version': 'pageid'
    },
    url,
  };
  option.headers = Object.assign({}, option.headers, headers);
  if (method === 'GET') delete option.body;
  try {
    let response = await axios(option);
    url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;//Custom-File-Name
    link.setAttribute('download', `${reportName || 'report'}`.replace('{time}', moment().valueOf()));
    document.body.appendChild(link);
    link.click();
    return response;
  } catch (error) {
    return error.response || error;
  }

}
request.socket = io.socket;
export default request;
