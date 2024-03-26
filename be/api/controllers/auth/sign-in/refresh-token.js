/**
 * @swagger
 * /api/auth/sign-in/refresh-token:
 *  post:
 *    tags:
 *      - Authentication
 *    description: api lấy thông tin qua token
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *        description: token lấy thông tin
 *        schema:
 *          type: string
 *          example: bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc0RlbGV0ZSI6ZmFsc2UsImNyZWF0ZWRBdCI6MTUzODk3NDMxMzA5MiwidXBkYXRlZEF0IjoxNTM4OTc0MzEzMDkyLCJkZWxldGVkQXQiOjAsIm5hbWUiOiJHaWF0IEt5IE1PXzFzIiwiYWRkcmVzcyI6ImRldmVsb3BtZW50IiwicGhvbmUiOiIiLCJhY2NvdW50Ijoic3RvcmUxIiwibG9ja2VkIjpmYWxzZSwiY3JlYXRlZEJ5IjpudWxsLCJkZWxldGVCeSI6bnVsbCwidHlwZSI6InN0b3JlIiwic3RvcmVJZCI6MX0.281F8hIP7KMscGwKL79p39tWNIps6CGdTH2--hsS7Hw
 *    responses:
 *      200:
 *        description: login success.
 *        schema:
 *          type: object
 *          example: {}
 *      400:
 *        description: Bad request
 *      403:
 *        description: Access denied/ Token hết hạn
 *      500:
 *        description: Server error
 */

const moment = require('moment');
module.exports = {


  friendlyName: 'Refresh token',


  description: '',


  inputs: {},


  exits: {},


  fn: async function (inputs, exits) {
    let req = this.req;
    let res = this.res;

    try {
      let ret = await Auth.login(null, null, null, req.auth.id);
      if (ret.status) {
        ret = Object.assign({}, ret.obj);
        ret.token = sails.helpers.jwt.generate(ret, (Conf.get('TTL_TOKEN')) || 0); //0 = life time
        User.removeUneccessaryValue(ret.user);
        Auth.removeUneccessaryValue(ret.auth);
        UserType.removeUneccessaryValue(ret.user.userType);
        return exits.success(ret);
      } else {
        return res.unauthorized({
          message: ret.message
        });
      }
    } catch (error) {
      return res.serverError(error);
    }


  }

};