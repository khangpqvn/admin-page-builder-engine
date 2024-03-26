const bcrypt = require('bcryptjs');
module.exports = {


  friendlyName: 'Hash password',


  description: '',


  inputs: {
    text: { type: 'string', description: 'Đoạn text cần băm' }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },

  sync: true,
  fn: function (inputs, exits) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(inputs.text, salt);
    return exits.success(hash);
  }
};

