module.exports = {


  friendlyName: 'Del',


  description: 'Del cache.',


  inputs: {
    key: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // TODO
    let client = sails.helpers.redisClient(),
      {
        key
      } = inputs;
    try {
      let ok = await new Promise((resolve, reject) => {
        client.del(key, function (err, o) {
          if (err) {
            return reject(err)
          }
          return resolve(o)
        });
      })
      exits.success(ok);
    } catch (error) {
      exits.error(error);
    }


  }


};