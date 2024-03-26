const blueprints = ['create', 'update', 'find', 'destroy'];
const _ = require('lodash');
const qs = require('qs');
module.exports = async function (req, res, next) {
    let apiVersion = req.headers['api-version'] || req.query['api-version'] || '';
    // console.log(req.session)

    if (apiVersion !== 'pageid') {
        return next();
    }
    let {
        params,
        options
    } = req;
    let {
        page,
        api,
        queryInput,
        skip,
        limit
    } = req.query;
    if (queryInput) {
        queryInput = JSON.parse(queryInput);
    } else {
        queryInput = {};
    }

    let input = JSON.parse(JSON.stringify(queryInput));
    if (req.method == 'POST' || req.method == 'PATCH' || req.method == 'PUT') {
        input = req.body;
    }
    if (!page || !api) {
        return res.serverError({
            code: 1,
            message: sails.__('Không tìm được trang')
        });
    }
    var pageInfo = await Page.getPage(page);
    if (!pageInfo) throw {
        code: 1,
        message: 'Không tìm được thông tin trang'
    };


    //check page role
    if (!(pageInfo.roles && pageInfo.roles.length > 0 && _.intersection(pageInfo.roles, req.user.roleId).length > 0)) {
        return res.unauthorized({
            code: 1,
            message: sails.__('Không có quyền truy cập trang')
        });
    }
    if (!pageInfo.apis) return res.serverError({
        code: 1,
        message: sails.__('Không tìm được trang')
    });
    let apiInfo = null;
    pageInfo.apis.map(a => {
        if (a.name == api) {
            apiInfo = a;
        }
    });
    if (!apiInfo) return res.serverError({
        code: 1,
        message: sails.__('Không tìm được api')
    });

    //check api role
    if (!(apiInfo.roles && apiInfo.roles.length > 0 && _.intersection(apiInfo.roles, req.user.roleId).length > 0)) {
        return res.unauthorized({
            code: 1,
            message: sails.__('Không có quyền truy cập api')
        });
    }
    if (apiInfo.boolExpression && !common.checkBoolExpression(apiInfo.boolExpression, req.body || {}, req.user || {})) {
        // log.info()
        return res.forbidden({
            message: sails.__('Dữ liệu không phù hợp, Xin vui lòng kiểm tra lại!')
        });
    }
    let action = options.action.split('/')[1];
    req.apiDescription = apiInfo.description;
    req.pageInfo = pageInfo;
    req.apiInfo = apiInfo;
    let prepareData = {},
        criterias = {};
    if (input.id) {
        prepareData = {
            id: input.id
        };
    }
    if (apiInfo.requestFields) {
        let requestFields = apiInfo.requestFields.split(',');
        for (var i = 0; i < requestFields.length; i++) {
            let field = requestFields[i];
            // if (!input[field]) continue;
            // mapInfoField(pageInfo, field, input, prepareData);
            prepareData[field] = input[field];
        }
    } else {
        prepareData = input;
        // for (var i in input) {
        //     mapInfoField(pageInfo, i, input, prepareData);
        // }
    }
    if (apiInfo.restrictFields) {
        let restrictFields = apiInfo.restrictFields.split(',');
        for (var i = 0; i < restrictFields.length; i++) {
            let field = restrictFields[i];
            delete prepareData[field];
        }
    }
    //check api options
    if (apiInfo.options && apiInfo.options.length) {
        apiInfo.options.map(option => {
            try {
                option.value = JSON.parse(option.value)
            } catch (error) {
                option.value = option.value || ''
                // console.error(error)
            }


            if (typeof option.value === 'object') {
                // criterias[crit.key] = crit.value;
                let tmp = JSON.stringify(option.value);
                for (const key in req.user) {
                    if (req.user.hasOwnProperty(key)) {
                        const ele = req.user[key];
                        if (Array.isArray(ele)) {
                            let a = '[';
                            ele.map((v, i) => {
                                if (i) {
                                    a += ','
                                }
                                if (typeof v === 'string') {
                                    a += `"${v}"`;
                                } else {
                                    a += v;
                                }
                            })
                            a += ']';
                            tmp = tmp.replaceAll('"@' + key + '@"', a)
                        } else {
                            tmp = tmp.replaceAll('"@' + key + '@"', ele)
                        }
                    }
                }
                // option.value = JSON.parse(tmp);
                // console.log({tmp:JSON.parse(tmp)})
                prepareData[option.key] = JSON.parse(tmp);

            } else
                if (typeof (option.value) == 'string' && option.value.substr(0, 2) == '--') {
                    let k = option.value.substr(2);
                    if (k == 'true' || k == 'false') {
                        if (k == 'true') {
                            prepareData[option.key] = 1
                        } else {
                            prepareData[option.key] = 0;
                        }

                    } else {
                        if (req.user[k] !== undefined) {
                            prepareData[option.key] = req.user[k];
                        } else {
                            return res.serverError({
                                code: 1,
                                message: sails.__('Tham số cố định không hợp lệ')
                            });
                        }
                    }

                } else {
                    prepareData[option.key] = option.value;
                }

        })
    }
    //check api criteria
    if (apiInfo.criterias && apiInfo.criterias.length) {
        apiInfo.criterias.map(crit => {
            if (typeof (crit.value) == 'string' && crit.value.substr(0, 2) == '--') {
                let k = crit.value.substr(2);
                if (k == 'true' || k == 'false') {
                    if (k == 'true') {
                        criterias[crit.key] = 1;
                    } else {
                        criterias[crit.key] = 0;
                    }

                } else {
                    if (req.user[k] !== undefined) {
                        criterias[crit.key] = req.user[k];
                    } else {
                        return res.serverError({
                            code: 1,
                            message: sails.__('Tham số cố định không hợp lệ')
                        });
                    }
                }

            } else {
                criterias[crit.key] = crit.value;
            }
        })
    }
    req.enableCaptcha = !!apiInfo.enableCaptcha;
    //if not blueprint
    if (!_.includes(blueprints, action)) {
        let prepareDataKeys = Object.keys(prepareData);
        if (req.method.toUpperCase() === 'GET' && prepareDataKeys.length) {
            action = 'find';
        } else {
            return next();
        }
    }
    switch (action) {
        case 'find':
            Object.assign(prepareData, criterias);
            for (const key in queryInput) {
                if (Array.isArray(prepareData[key]) && Array.isArray(queryInput[key])) {
                    prepareData[key] = _.intersection(prepareData[key], queryInput[key]);
                }
                if (Array.isArray(prepareData[key]) && !Array.isArray(queryInput[key])) {
                    prepareData[key] = _.intersection(prepareData[key], [queryInput[key]]);
                }
            }
            // let exportExcel = false; //req.method == 'GET';
            // if (exportExcel) {
            //     delete prepareData.skip;
            //     delete prepareData.limit;
            // }

            req.query.where = JSON.stringify(prepareData);
            req.query.limit = limit || 10000;
            req.query.skip = skip;
            if (apiInfo.responseFields) {
                req.query.select = apiInfo.responseFields;
            }
            req.query = Object.assign(req.query, prepareData);
            if (apiInfo.fixedQuery) {
                req.query = Object.assign(qs.parse(apiInfo.fixedQuery), req.query);
            }
            return next();

        case 'create':
            delete prepareData.id;
            req.body = prepareData;
            req.query = {};
            req.params = {};
            try {
                // await sails.models[controller].create(prepareData);
                req.body = prepareData;
                return next();
            } catch (err) {
                return res.serverError({
                    code: 1,
                    message: sails.__('Không tạo được dữ liệu')
                });
            }
            break;
        case 'update':
            if (criterias.id == undefined) {
                criterias.id = (params.id);
            }
            if (params.id != criterias.id) {
                return res.forbidden({
                    message: sails.__('403'),
                    error: 'PERMISSION_DENIED'
                });
            }
            try {
                // rs = await sails.models[controller].update(criterias).set(prepareData).fetch();
                delete prepareData.isDelete;
                delete prepareData.deletedAt;
                delete prepareData.deletedBy;
                delete prepareData.id;
                // console.log({ prepareData, criterias })
                var model = sails.models[options.model];


                let ret = await model.findOne(criterias);
                if (!ret) {
                    return res.forbidden({
                        message: sails.__('403'),
                        error: 'PERMISSION_DENIED'
                    });
                }
                req.params = criterias;
                req.body = prepareData;
                return next();
            } catch (err) {
                return res.serverError({
                    code: 1,
                    message: sails.__('Dữ liệu không được cập nhật'),
                    error: String(err)
                });
            }
        case 'destroy':
            if (criterias.id == undefined) {
                criterias.id = (params.id);
            }
            if (params.id != criterias.id) {
                return res.forbidden({
                    message: sails.__('403'),
                    error: 'PERMISSION_DENIED'
                });
            }
            try {
                var model = sails.models[options.model];
                let obj = await model.findOne(criterias);
                if (obj) {
                    let ret = await model.updateOne(criterias).set({
                        isDelete: true,
                        deletedAt: Date.now(),
                        deletedBy: req.user.id,
                        id: criterias.id
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
            req.body = prepareData;
            req.queryInput = prepareData;
            return next();
    }
}