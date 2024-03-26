/**
 * @swagger
 * /api/auth/sign-in/account:
 *  post:
 *    tags:
 *      - Authentication
 *    description: api đăng nhập cho các tài khoản không nằm trong hệ thống các cửa hàng
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: body
 *        description: request body
 *        in: body
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            account:
 *              type: string
 *              description: account
 *              required: true
 *              example: user
 *            password:
 *              type: string
 *              required: true
 *              example: abc1234
 *            type: 
 *              type: string
 *              required: true
 *              example: up/card
 *    responses:
 *      200:
 *        description: login success.
 *      400:
 *        description: Bad request
 *      403:
 *        description: Access denied
 *      500:
 *        description: Server error
 */

module.exports = {
  friendlyName: 'Local',

  description: 'login with account and password',

  inputs: {
    account: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {},

  fn: async function (inputs, exits) {
    let req = this.req;
    let res = this.res;

    try {
      let ret = await Auth.login(inputs.account, inputs.password, 'up');

      if (ret.status) {
        let {
          auth,
          user
        } = ret.obj;

        req.auth = auth;
        req.user = user;
        ret = Object.assign({}, ret.obj);
        let timeToLifeToken = Conf.get('TTL_TOKEN');
        ret.token = sails.helpers.jwt.generate(ret, timeToLifeToken || 0);
        User.removeUneccessaryValue(ret.user);
        Auth.removeUneccessaryValue(ret.auth);
        UserType.removeUneccessaryValue(ret.user.userType);
        return exits.success(ret);
      } else {
        return res.forbidden({
          message: ret.message
        });
      }
    } catch (e) {
      return res.serverError(e);
    }

  }
};