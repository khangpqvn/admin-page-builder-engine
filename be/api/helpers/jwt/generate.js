const jwt = require('jwt-simple');
const moment = require('moment');

module.exports = {


  friendlyName: 'Generate',


  description: 'Generate jwt.',


  inputs: {
    payload: { type: 'ref', required: true },
    timeOutInMinutes: { type: 'number', defaultsTo: 0 }
  },
  sync: true,

  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: function (inputs, exits) {
    let payload = inputs.payload;
    if (inputs.timeOutInMinutes) {
      payload.exp = moment().valueOf() + inputs.timeOutInMinutes * 60 * 1000;
    }
    let encodedToken = jwt.encode(payload, sails.config.globals.JWT_TOKEN_SECRET);
    return exits.success('bearer ' + encodedToken);
  }
};

