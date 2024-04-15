import request from './request';
import local from './local';
import queryString from 'qs';
import _ from 'lodash';
import Local from './local';
import configureStore from '../store';
import { getText } from 'number-to-text-vietnamese';

import {
  toast
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let helper = {};
helper.replaceAll = (str, search, replacement) => {
  if (!str) str = '';
  return str.replace(new RegExp(search, 'g'), replacement);
}
helper.reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

helper.getApiByName = (apis, name) => {
  for (var i = 0; i < apis.length; i++) {
    if (apis[i].name === name) return apis[i];
  }
  return null;
}
helper.showCustomModal = opts => {
  let {
    type,
    props
  } = opts;
  let store = configureStore();
  return new Promise((resolve, reject) => {
    store.dispatch({
      type: 'PUSH_MODAL',
      data: {
        type,
        props,
        cb: rs => {
          resolve(rs);
        }
      }
    })
  })

  // alert(content);
}
helper.alert = content => {
  let store = configureStore();
  store.dispatch({
    type: 'PUSH_MODAL',
    data: {
      type: 'message',
      content
    }
  })
  // alert(content);
}
helper.toastSuccess = (content) => {
  toast.success(content, {
    position: toast.POSITION.TOP_RIGHT
  });
}
helper.toastError = (content) => {
  toast.error(content, {
    position: toast.POSITION.TOP_RIGHT
  });
}
helper.confirm = content => {
  return new Promise((resolve, reject) => {
    let store = configureStore();
    store.dispatch({
      type: 'PUSH_MODAL',
      data: {
        type: 'confirm',
        content,
        cb: rs => {
          // console.log('111', rs, rs === 1);
          resolve(rs === 1);
        }
      }
    })
  })
}
helper.callPageApi = (page, name, data) => {
  let api = helper.getApiByName(page.apis, name);
  let input = _.clone(data),
    url = api.url;
  switch (api.method) {
    case 'GET':
      for (var i in data) {
        if (data[i] === undefined) delete data[i];
      }
      input = Object.assign({}, {
        page: page.id,
        api: api.name,
      }, data);
      url += `?${queryString.stringify(input)}`
      break;
    case 'PATCH':
    case 'DELETE':
      if (api.type === 'update') {
        url += `/${data.id}?${queryString.stringify({ page: page.id, api: api.name })}`;
        delete input.id;
      }
      break;
    default:
      url += `?${queryString.stringify({ page: page.id, api: api.name })}`;
      break;
  }
  return request.request(`${url}`, input, {}, api.method);
}
helper.report = async (page, name, data, reportName) => {
  let api = helper.getApiByName(page.apis, name);
  let input = _.clone(data),
    url = api.url;
  switch (api.method) {
    case 'GET':
      for (var i in data) {
        if (data[i] === undefined) delete data[i];
      }
      input = Object.assign({}, {
        page: page.id,
        api: api.name,
        report: 1
      }, data);
      url += `?${queryString.stringify(input)}`

      let rss = await request.report(url, reportName);
      if (rss.status !== 200) {
        helper.alert(rss.data.message || 'Internal server error');
      }
      break;
    default:
      break;
  }
  // console.log('report url', url);
  return url;
}
helper.getApiUrl = (page, name) => {
  let api = null;
  for (var i = 0; i < page.apis.length; i++) {
    if (page.apis[i].name === name) {
      api = page.apis[i];
      break;
    }
  }
  switch (api.action) {
    default:
      return `/${api.controller}/${api.action}?page=${page.id}&api=${name}`;
  }
}
helper.refreshToken = async (props) => {
  try {
    if (!Local.get('session')) {
      if (props) {
        props.history.replace('/login');
      }
      return false
    }
    let rs = await request.request('/api/auth/sign-in/refresh-token?page=16&api=refresh-token');
    Local.set('session', rs.token);
    Local.set('user', JSON.stringify(rs.user));
    Local.set('auth', JSON.stringify(rs.auth));
    return true;
  } catch (err) {
    local.clear();
    if (props)
      props.history.replace('/login');
    helper.alert(err.message);
    return false;
  }
}
helper.getPage = async id => {
  let userInfo = local.get('user');
  // id = Number(id);
  let meta = local.get('meta');
  if (!meta) {
    window.location.href = '/login'
  }
  let pages = meta.pages;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id == id) {
      if (!Array.isArray(pages[i].buttons)) pages[i].buttons = [];
      if (pages[i].buttons) {
        let tmpButtons = []
        pages[i].buttons.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpButtons.push(i);
          }
          return i;
        });
        pages[i].buttons = tmpButtons;
      }
      if (pages[i].grid) {
        let tmpGrid = [];
        pages[i].grid.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpGrid.push(i);
          }
          return;
        });
        pages[i].grid = tmpGrid;
      }

      if (pages[i].schema) {
        let tmpSchema = [];
        pages[i].schema.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpSchema.push(i);
          }
          return;
        });
        pages[i].schema = tmpSchema;
      }


      return pages[i]
    }
  }
}
helper.getPageSync = id => {
  let userInfo = local.get('user');
  // id = Number(id);
  let meta = local.get('meta');
  if (!meta) {
    window.location.href = '/login'
  }
  let pages = meta.pages;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id == id) {
      if (!Array.isArray(pages[i].buttons)) pages[i].buttons = [];
      if (pages[i].buttons) {
        let tmpButtons = []
        pages[i].buttons.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpButtons.push(i);
          }
          return i;
        });
        pages[i].buttons = tmpButtons;
      }
      if (pages[i].grid) {
        let tmpGrid = [];
        pages[i].grid.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpGrid.push(i);
          }
          return;
        });
        pages[i].grid = tmpGrid;
      }

      if (pages[i].schema) {
        let tmpSchema = [];
        pages[i].schema.map(i => {
          if (!(i.roles && i.roles.length > 0 && _.intersection(i.roles, userInfo.roleId).length === 0)) {
            tmpSchema.push(i);
          }
          return;
        });
        pages[i].schema = tmpSchema;
      }


      return pages[i]
    }
  }
}

//Nhóm Function check việc trường/nút bấm được phép hiện ra hay không
//Output: boolean   (true => Trường/nút bấm bị ẩn)

function getFieldReferValue(fieldName, rowData, userData) {
  // console.log({fieldName,rowData, userData})
  if (typeof fieldName !== 'string') {
    return fieldName;
  }
  let ret = fieldName;
  let tmp = fieldName.split('.');
  if (tmp.length === 1) {
    return ret;
  }
  try {
    switch (tmp[0]) {
      case 'this':
        ret = JSON.parse(JSON.stringify(rowData));
        break;
      case 'user':
        if (userData) {
          ret = JSON.parse(JSON.stringify(userData));
        } else {
          ret = local.get('user');
        }
        break;
      case 'special':
        switch (tmp[1]) {
          case 'undefined':
            return undefined;
        }
      default:
        return ret;
    }
    for (let i = 1; i < tmp.length; i++) {
      const key = tmp[i];
      if (ret[key] !== undefined) {
        ret = ret[key];
      } else {
        return fieldName;
      }
    }
    return ret;
  } catch (error) {
    // console.log({userData})
    console.error({
      error
    })
    return fieldName;
  }

}


function checkArray(key, arr, rowData, userData) {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (Array.isArray(element) && checkArray(key, element, rowData, userData)) {
      return true;
    } else
      if (checkObject(key, element, rowData, userData)) {
        return true;
      }
  }
  return false;
}

function checkObject(key, obj, rowData, userData) {

  if (!key) {
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        const e = obj[k];
        if (Array.isArray(e)) {
          if (!checkArray(k, e, rowData, userData)) {
            return false;
          }
        } else {
          if (!checkObject(k, e, rowData, userData)) {
            return false;
          }
        }
      }
    }
    return true;
  } else {
    let compareValue = getFieldReferValue(key, rowData, userData)
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const e = obj[i];
        if (checkObject(key, e, rowData, userData)) {
          return true;
        }
      }
      return false;
    } else
      for (const k in obj) {
        let data = obj[k];
        if (Array.isArray(data)) {
          data = data.map(v => getFieldReferValue(v, rowData, userData))
        } else {
          data = getFieldReferValue(data, rowData, userData);
        }
        switch (k) {
          case 'in':
            if (!Array.isArray(data)) return false;
            if (Array.isArray(compareValue) && _.intersection(compareValue, data).length !== compareValue.length) {
              return false;
            } else if (!data.includes(compareValue)) {
              return false;
            }
            break;
          case 'nin':
            if (!Array.isArray(data)) return false;
            if (Array.isArray(compareValue) && _.intersection(compareValue, data).length === compareValue.length) {
              return false;
            } else if (data.includes(compareValue)) {
              return false;
            }
            break;
          case '=':
            if (compareValue !== data) {
              return false;
            }
            break;
          case '==':
            if (compareValue != data) {
              return false;
            }
            break;
          case '>':
            if (isNaN(+compareValue) || isNaN(+data) || (+compareValue) <= (+data)) {
              return false;
            }
            break;
          case '<':
            if (isNaN(+compareValue) || isNaN(+data) || (+compareValue) >= (+data)) {
              return false;
            }
            break;
          case '>=':
            if (isNaN(+compareValue) || isNaN(+data) || (+compareValue) < (+data)) {
              return false;
            }
            break;
          case '<=':
            if (isNaN(+compareValue) || isNaN(+data) || (+compareValue) > (+data)) {
              return false;
            }
            break;
          case '!=':
            if (compareValue === data) {
              return false;
            }
            break;
          case '!==':
            if (compareValue == data) {
              return false;
            }
            break;
          case 'contains':
            if (typeof compareValue !== 'string' || typeof data !== 'string') {
              return false
            }
            if (!compareValue.includes(data)) {
              return false;
            }
            break;
          case 'startsWith':
            if (typeof compareValue !== 'string' || typeof data !== 'string') {
              return false
            }
            if (!compareValue.startsWith(data)) {
              return false;
            }
            break;
          case 'endsWith':
            if (typeof compareValue !== 'string' || typeof data !== 'string') {
              return false
            }
            if (!compareValue.endsWith(data)) {
              return false;
            }
            break;
        }
      }
    return true;
  }
}
helper.getFieldReferValue = getFieldReferValue;

helper.checkHideExpression = (hideExpression, rowData = {}) => {
  if (!hideExpression) return false;
  let user = local.get('user');
  //[]=or  {} = and
  // let example = [
  //     {
  //         "this.id": [
  //             { "in": [10, "user.userType.id"] },
  //             { ">": 10 },
  //             { "<": "user.id", ">=": 1, "<=": 1 },
  //         ]
  //     },
  //     { "user.id": { "=": "this.id" } },
  // ]
  try {
    //trường hợp điều kiện ẩn được định nghĩa dạng json
    hideExpression = JSON.parse(hideExpression);

    if (Array.isArray(hideExpression)) {
      return checkArray(null, hideExpression, JSON.parse(JSON.stringify(rowData)), user)
    } else {
      return checkObject(null, hideExpression, JSON.parse(JSON.stringify(rowData)), user)
    }

  } catch (error) {
    //Trường hợp điều kiện ẩn được định nghĩa dạng chuỗi eval. Lưu ý chỉ dùng cho các dữ liệu nguyên thủy. Không khuyến nghị dùng
    let str = hideExpression + '';
    for (let i in rowData) {
      str = helper.replaceAll(str, 'this.' + i, rowData[i]);
    }

    for (let j in user) {
      str = helper.replaceAll(str, 'user.' + j, user[j]);
    }
    return !!window.eval(str)
  }

}

helper.parseQueryData = function (embed) {
  if (embed) {
    let tmp = embed;
    if (typeof tmp === 'string') {
      try {
        tmp = JSON.parse(tmp)
      } catch (error) {
        tmp = undefined;
      }
    } else if (typeof tmp !== 'object') {
      tmp = undefined;
    }
    return tmp
  }
  return undefined;
}


var DOCSO = function () {
  var t = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"],
    r = function (r, n) {
      var o = "",
        a = Math.floor(r / 10),
        e = r % 10;
      return a > 1 ? (o = " " + t[a] + " mươi", 1 == e && (o += " mốt")) : 1 == a ? (o = " mười", 1 == e && (o += " một")) : n && e > 0 && (o = " lẻ"), 5 == e && a >= 1 ? o += " lăm" : 4 == e && a >= 1 ? o += " tư" : (e > 1 || 1 == e && 0 == a) && (o += " " + t[e]), o
    },
    n = function (n, o) {
      var a = "",
        e = Math.floor(n / 100),
        n = n % 100;
      return o || e > 0 ? (a = " " + t[e] + " trăm", a += r(n, !0)) : a = r(n, !1), a
    },
    o = function (t, r) {
      var o = "",
        a = Math.floor(t / 1e6),
        t = t % 1e6;
      if (a > 0) {
        o = n(a, r) + " triệu";
        r = !0;
      }
      var e = Math.floor(t / 1e3),
        t = t % 1e3;
      return e > 0 && (o += n(e, r) + " nghìn", r = !0), t > 0 && (o += n(t, r)), o
    };
  return {
    doc: function (r) {

      if (0 == r) return t[0];
      let [left, rigth] = (r + "").split(".");
      r = +left;
      var n = "",
        a = "",
        isNega = false;
      if (r < 0) { r *= -1; isNega = true; }

      do {
        var ty = r % 1e9;
        r = Math.floor(r / 1e9);
        n = r > 0 ? o(ty, !0) + a + n : o(ty, !1) + a + n;
        a = " tỷ";
      } while (r > 0);
      let ret = isNega ? "Âm " + n.trim() : n.trim();
      if (rigth) {
        ret += " phẩy " + rigth.split("").map(v => { return t[+v] }).join(' ')
      }
      return ret;
    }
  }
}();


helper.convertNumberToText = DOCSO.doc;
// helper.convertNumberToText = function (number) {
//   return getText(number, ',')
// }

helper.loadFeConf = async () => {
  let config = await request.request('/api/admin/get-fe-conf');

  local.set('confs', JSON.stringify(config.confs));
}

helper.getConf = function (key) {
  let conf = local.get('confs');
  if (conf) {
    return conf[key]
  }
  return undefined;
}

export default helper;
