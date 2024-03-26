const moment = require('moment');
module.exports = {


  friendlyName: 'Change forget password',


  description: '',


  inputs: {
    account: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string',
      required: true
    },
    newPassword: {
      type: 'string',
      required: true,
      regex: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{6,}$/
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    let req = this.req;
    let res = this.res;
    try {
      // let current = moment().valueOf();
      // let authResetPassword = await AuthResetPassword.findOne({
      //   token: inputs.token, type: inputs.type, key: inputs.account.toLowerCase(),
      //   isDelete: false, expiredAt: { '>': current }, isUse: false
      // });
      let authResetPassword = (await sails.helpers.cache.get('authResetPassword_' + inputs.token)) || '{}';
      authResetPassword = JSON.parse(authResetPassword)
      if (!authResetPassword || inputs.account !== authResetPassword.key) {
        return res.notFound({
          message: sails.__('Đường link đổi mật khẩu không khả dụng, đã quá hạn hoặc đã được sử dụng!')
        });
      }
      await Auth.updateOne({
        id: authResetPassword.auth
      }).set({
        password: inputs.newPassword,
        activated: true
      });
      // await AuthResetPassword.updateOne({ id: authResetPassword.id }).set({ isUse: true });
      await sails.helpers.cache.del('authResetPassword_' + inputs.token);

      return exits.success({
        message: sails.__('Thay đổi mật khẩu thành công!')
      });
    } catch (error) {
      return res.serverError(error)
    }
  }


};