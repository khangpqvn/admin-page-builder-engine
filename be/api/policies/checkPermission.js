const intersectionWith = require('lodash.intersectionwith');
var arrQuery = require('array-query');
const _ = require('@sailshq/lodash')
module.exports = async function (req, res, next) {

  let {
    query,
    params,
    options,
    method
  } = req;
  // console.log({path: options.action});
  let apiVersion = req.headers['api-version'] || req.query['api-version'] || '';
  // console.log(req.session)

  if (apiVersion === 'pageid') {
    return next();
  }

  // if (req.session && req.session.loginInfo)
  //   // console.log({ loginInfo: req.session.loginInfo });
  // if (req.user.roleId && req.user.roleId.indexOf(Role.BASE_ROLES.SUPER_ADMIN) >= 0) {
  //   //Allow all for supper admin
  //   req.session.apiDescription = 'system admin tác động hệ thống';
  //   // return next();
  // }

  let apis = Api.getCache();
  if (!apis || !apis.length) {
    try {

      apis = await Api.setCache();
      if (!apis || !apis.length) {
        throw new Error('MISSING_CACHE_APIs');
      }
    } catch (e) {
      log.error(e);
      return res.serverError({
        message: sails.__('500'),
        error: String(e)
      });
    }
  }


  let api = arrQuery('actionPath').is(options.action)
    .and('apiVersion').is(apiVersion)
    .and('method').is(method)
    .on(apis);

  if (api.length === 1) {
    req.apiDescription = api[0].description;
    req.enableCaptcha = !!api[0].enableCaptcha;
    api = api[0];

    //gọi api model
    if (apiVersion !== 'public' && ((!req.user.roleId || !req.user.roleId.length) || intersectionWith((api.requireRoleIds || []), req.user.roleId).length === 0)) {
      //check quyền có được phép truy cập api không
      req.responseMessageLog = sails.__('403');
      // return next(new Error(mess.message));
      return res.forbidden({
        message: sails.__('403')
      });
    }
    if (api.boolExpression) {
      let checkBoolResult = common.checkBoolExpression(api.boolExpression, req.body || {}, req.user || {})
      // return next(new Error(mess.message));
      if (!checkBoolResult) {
        return res.forbidden({
          message: sails.__('Dữ liệu không phù hợp, Xin vui lòng kiểm tra lại!')
        });
      }
    }

    if (!options.model) {
      // qua controller luôn
      if (req.method.toUpperCase() === 'GET') {
        if (api.selectedFields && Array.isArray(api.selectedFields) && api.selectedFields.length > 0) {
          req.query.select = api.selectedFields.toString();
        }
        if (!req.query.limit) {
          req.query.limit = 10000
        }
        if (api.ignoreFields && Array.isArray(api.ignoreFields) && api.ignoreFields.length > 0) {
          req.query.omit = api.ignoreFields.toString();
        }

        let where = {};
        if (query.where) {
          try {
            where = JSON.parse(query.where);
          } catch (e) {
            return res.badRequest({
              message: sails.__('400'),
              error: String(e)
            });
          }
        }
        if (api.userIdField) {
          where[api.userIdField] = req.user.id;
        }

        for (let attrName in api.conditions) {
          where[attrName] = api.conditions[attrName];
        }
        if (req.user) {
          let user = req.user;
          for (let attrName in api.whereByUserField) {
            let mappingField = api.whereByUserField[attrName];
            where[attrName] = user[mappingField];
          }
        }

        if (Object.keys(where).length) {
          req.query.where = JSON.stringify(where);
        }
        if (!query.sort) {
          query.sort = JSON.stringify([{
            createdAt: 'DESC'
          }]);
        }
      }

      return next();
    } else {
      switch (options.action.split('/')[1]) {
        case 'create':
          req.query = {};
          for (let ignore in api.ignoreFields) {
            delete req.body[api.ignoreFields[ignore]];
          }
          if (api.userIdField && req.user) {
            req.body[api.userIdField] = req.user.id;
          }

          if (api.fieldAllowValue && typeof api.fieldAllowValue === 'object' && Object.keys(api.fieldAllowValue).length) {
            for (const key in api.fieldAllowValue) {
              if (api.fieldAllowValue.hasOwnProperty(key)) {
                const e = api.fieldAllowValue[key];
                if (req.body[key] !== undefined && e.length) {
                  let value = req.body[key];
                  if (Array.isArray(value) && !_.intersection(value, e).length === value.length) {
                    return res.forbidden({
                      message: sails.__('403'),
                      error: 'Giá trị trường "' + key + '" không hợp lệ'
                    })
                  } else {
                    if (!e.includes(value)) {
                      return res.forbidden({
                        message: sails.__('403'),
                        error: 'Giá trị trường "' + key + '" không hợp lệ'
                      })
                    }
                  }
                }
              }
            }
          }

          // req.body.createdBy = req.user.id;
          return next();
        case 'find':
          if (api.selectedFields && Array.isArray(api.selectedFields) && api.selectedFields.length > 0) {
            req.query.select = api.selectedFields.toString();
          }
          if (!req.query.limit) {
            req.query.limit = 10000
          }
          if (api.ignoreFields && Array.isArray(api.ignoreFields) && api.ignoreFields.length > 0) {
            req.query.omit = api.ignoreFields.toString();
          }

          let where = {};
          if (query.where) {
            try {
              where = JSON.parse(query.where);
            } catch (e) {
              return res.badRequest({
                message: sails.__('400'),
                error: String(e)
              });
            }
          }
          if (api.userIdField) {
            where[api.userIdField] = req.user.id;
          }

          for (let attrName in api.conditions) {
            where[attrName] = api.conditions[attrName];
          }
          if (req.user) {
            let user = req.user;
            for (let attrName in api.whereByUserField) {
              let mappingField = api.whereByUserField[attrName];
              where[attrName] = user[mappingField];
            }
          }

          if (Object.keys(where).length) {
            req.query.where = JSON.stringify(where);
          }
          if (!query.sort) {
            query.sort = JSON.stringify([{
              createdAt: 'DESC'
            }]);
          }
          return next();


        case 'update':
          req.query = {};
          for (let ignore in api.ignoreFields) {
            delete req.body[api.ignoreFields[ignore]];
          }
          var model = sails.models[options.model];

          if (api.userIdField) {
            // if (params[api.userIdField]) {
            //   if (params[api.userIdField] != req.user.id) {
            //     //check params exist id but id not allow 
            //     return res.forbidden({
            //       message: sails.__('403'),
            //       error: 'PERMISSION_DENIED'
            //     });
            //   }
            // } else {
            params[api.userIdField] = req.user.id;
            // }
          }

          for (let attr in api.conditions) {
            params[attr] = api.conditions[attr];
          }
          if (req.user) {
            let user = req.user;
            for (let attrName in api.whereByUserField) {
              let mappingField = api.whereByUserField[attrName];
              params[attrName] = user[mappingField];
            }
          }

          if (api.fieldAllowValue && typeof api.fieldAllowValue === 'object' && Object.keys(api.fieldAllowValue).length) {
            for (const key in api.fieldAllowValue) {
              if (api.fieldAllowValue.hasOwnProperty(key)) {
                const e = api.fieldAllowValue[key];
                if (req.body[key] !== undefined && e.length) {
                  let value = req.body[key];
                  if (Array.isArray(value) && !_.intersection(value, e).length === value.length) {
                    return res.forbidden({
                      message: sails.__('403'),
                      error: 'Giá trị trường "' + key + '" không hợp lệ'
                    })
                  } else {
                    if (!e.includes(value)) {
                      return res.forbidden({
                        message: sails.__('403'),
                        error: 'Giá trị trường "' + key + '" không hợp lệ'
                      })
                    }
                  }
                }
              }
            }
          }

          try {
            let ret = await model.findOne(params);
            if (!ret) {
              return res.forbidden({
                message: sails.__('403'),
                error: 'PERMISSION_DENIED'
              });
            }
          } catch (e) {
            return res.serverError({
              message: sails.__('500'),
              error: String(e)
            });
          }
          return next();

        case 'destroy':
          var model = sails.models[options.model];
          if (api.userIdField) {
            // if (params[api.userIdField]) {
            //   if (params[api.userIdField] != req.user.id) {
            //     //check params exist id but id not allow 
            //     return res.forbidden({
            //       message: sails.__('403'),
            //       error: 'PERMISSION_DENIED'
            //     });
            //   }
            // } else {
            params[api.userIdField] = req.user.id;
            // }
          }

          for (let attr in api.conditions) {
            params[attr] = api.conditions[attr];
          }
          if (req.user) {
            let user = req.user;
            for (let attrName in api.whereByUserField) {
              let mappingField = api.whereByUserField[attrName];
              params[attrName] = user[mappingField];
            }
          }

          try {
            let obj = await model.findOne(params);
            if (obj) {
              let ret = await model.updateOne(params).set({
                isDelete: true,
                deletedAt: Date.now(),
                deletedBy: req.user.id
              });

              return res.ok(ret);
            } else {
              return res.forbidden({
                message: sails.__('403'),
                error: 'PERMISSION_DENIED'
              });
            }
          } catch (e) {
            return res.serverError({
              message: sails.__('500'),
              error: String(e)
            });
          }
        default:
          return res.notFound({
            message: sails.__('404'),
            error: sails.__('Không tìm thấy api!')
          });
      }
    }
  } else {
    return res.notFound({
      message: sails.__('404'),
      error: sails.__('Không tìm thấy api!')
    });
  }
};