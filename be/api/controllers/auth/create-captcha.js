const svgCaptcha = require('svg-captcha');
module.exports = {


  friendlyName: 'Tạo một mã captcha mới',
  type: 'backend',

  description: '',


  inputs: {

  },


  exits: {
    success: {
      statusCode: 200
    }
  },


  fn: async function (inputs, exits) {
    try {
      let res = this.res;
      let req = this.req;
      let origin = this.req.headers.origin;
      // if (process.env.NODE_ENV === 'production' && origin !== Conf.get('BASE_ADMIN_PAGE_URL') && origin !== Conf.get('BASE_USER_PAGE_URL')) {
      //   return res.forbidden({
      //     message: sails.__('DOMAIN NOT ALLOW!')
      //   });
      // }
      var data = svgCaptcha.create({
        background: '#cc9966',
        noise: 10,
        ignoreChars: '',
        charPreset: '0123456789'
      });
      //create capt
      let captInfo = await Capt.create({
        text: data.text
      }).fetch();
      return exits.success({
        message: sails.__('Thành công'),
        data: data.data,
        id: captInfo.id
      });
    } catch (err) {
      return this.res.serverError(err);
    }
  }
};