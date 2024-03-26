const moment = require('moment');
const md5 = require('md5');
const uuidv1 = require('uuid/v1');

module.exports = {


  friendlyName: 'Forget password',


  description: '',


  inputs: {
    account: {
      type: 'string',
      required: true
    },
    type: {
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
      let auth = await Auth.findOne({
        key: (inputs.account + '').toLowerCase(),
        type: inputs.type,
        isDelete: false
      }).populate('user');
      if (!auth) {
        return res.notFound({
          message: sails.__('Không tìm thấy tài khoản!')
        });
      }
      if (!auth.user.email) {
        return res.notFound({
          message: sails.__('Tài khoản không đăng ký địa chỉ email!')
        });
      }
      // auth.
      let token = md5(auth.key + auth.type + moment().valueOf() + uuidv1());
      let authResetPassword = {
        auth: auth.id,
        key: auth.key,
        type: auth.type,
        token: token,
        expiredAt: moment().valueOf() + 24 * 60 * 60 * 1000,
        isUse: false
      }
      // await AuthResetPassword.create(authResetPassword);
      //GEn OTP token 24h in redis
      await sails.helpers.cache.set('authResetPassword_' + token, JSON.stringify(authResetPassword), 24 * 60 * 60);
      let link = Conf.get('RESET_FORGET_ACCOUNT_URL').replace('{{token}}', token).replace('{{account}}', auth.key);
      let content = `Bạn hoặc ai đó đã yêu cầu cấp lại mật khẩu cho tài khoản <b>${auth.key}</b> !
      <br><br>
      Vui lòng truy cập đường dẫn <a href="${link}">${link}</a> để cập nhật lại mật khẩu của bạn hoặc bỏ qua nếu không phải bạn đã thực hiện việc này! 
      <br><br>
      Lưu ý: Đường link chỉ được sử dụng 01 lần và có thời hạn trong 24 giờ
      <br><br><br>
      
      Trân trọng cảm ơn, 
      <br><br>
      ------------------------------------------- 
      `
      pushNotification.sendMail(auth.user.email, sails.__('[Thông báo] - Lấy lại mật khẩu qua email!'), content, req, {}).catch(e => {
        log.error(e, req)
      });
      return exits.success({
        message: sails.__('BẠN VUI LÒNG ĐĂNG NHẬP EMAIL VÀ XÁC NHẬN PHỤC HỒI MẬT KHẨU QUA LINK.')
      })
    } catch (error) {
      return res.serverError(error);
    }
  }


};