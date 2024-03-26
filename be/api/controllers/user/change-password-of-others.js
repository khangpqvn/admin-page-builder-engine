module.exports = {


  friendlyName: 'Change password of others',


  description: '',


  inputs: {
    userId: {
      type: 'string',
      required: true,
      description: 'User ID '
    },
    newPassword: {
      type: 'string',
      required: true
    },
    confirmPassword: {
      type: 'string',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs,exits)  {
    let {
      req,
      res
    } = this;
    let sessionUser = req.user;
    if (inputs.newPassword !== inputs.confirmPassword) {
      return res.badRequest({ message: sails.__('Mật khẩu nhập lại không khớp') })
    }
    if (!sails.helpers.common.checkPasswordStrength(inputs.newPassword)) {
      return res.badRequest({
        message: sails.__('Mật khẩu phải bao gồm cả chữ và số đồng thời ít nhất 6 ký tự!')
      });
    }
    try {
      let auth = await Auth.find({
        user: inputs.userId,
        type: 'up',
        isDelete: false
      });
      if (auth.length!==1) {
        return res.notFound({
          message: sails.__('Không tìm thấy thông tin tài khoản')
        });
      };
      auth = auth[0];
      let check = await sails.helpers.user.checkPermissionOnUpdateUser(sessionUser, auth.user);
      if (!check) {
        return res.forbidden({
          message: sails.__('Không đủ quyền thực hiện hành động!')
        })
      }
      await Auth.updateOne({
        id: auth.id
      }).set({
        password: inputs.newPassword
      });

      return exits.success({
        message: sails.__('Đổi mật khẩu thành công!') + ` Tài khoản: ${auth.key} ---- Mật khẩu: ${inputs.newPassword}`
      });
    } catch (error) {
      return res.serverError(error)
    }
  }


};