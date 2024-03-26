module.exports = {


  friendlyName: 'Active user',


  description: '',


  inputs: {
    account: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    let req = this.req;
    let res = this.res;

    try {
      let activeAccountInfo = JSON.parse((await sails.helpers.cache.get('authActivate_' + inputs.token)) || '{}');
      if (!activeAccountInfo || inputs.account !== activeAccountInfo.key) {
        return res.notFound({
          message: sails.__('Đường link kích hoạt tài khoản không khả dụng, đã quá hạn hoặc đã được sử dụng!')
        });
      }
      await Auth.updateOne({
        id: activeAccountInfo.auth
      }).set({
        activated: true
      });
      await sails.helpers.cache.del('authActivate_' + inputs.token);

      return exits.success({
        message: sails.__(`Kích hoạt tài khoản --- ${inputs.account} --- thành công!`)
      });
    } catch (error) {
      return res.serverError(error)
    }

  }


};