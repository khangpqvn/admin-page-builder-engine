module.exports = {


  friendlyName: 'Check password strength',


  description: '',


  inputs: {
    text: { type: 'string', description: 'Chuỗi mật khẩu cần kiểm tra', required: true }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },
  sync: true,

  fn: function (inputs, exits) {
    var strongRegex = constant.PASSWORD_REGEX;
    return exits.success(strongRegex.test(inputs.text));
  }


};

