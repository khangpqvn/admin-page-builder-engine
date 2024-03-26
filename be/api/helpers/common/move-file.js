const fs = require('fs');
module.exports = {


  friendlyName: 'Move file',


  description: '',


  inputs: {
    oldPath: { type: 'string', description: 'Đường dẫn file cũ', required: true },
    newPath: { type: 'string', description: 'Đường dẫn tới file mới', required: true }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      let { oldPath, newPath } = inputs;
      await new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            // console.log('reject');
            return reject(err);
          }
          // console.log('resolve');

          return resolve();
        });
      });
      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  }
};

