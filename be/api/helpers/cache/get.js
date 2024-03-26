module.exports = {


  friendlyName: 'Get',


  description: 'Get cache.',


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

    try {
      let data = await new Promise((resolve, reject) => {
        let client = sails.helpers.redisClient(),
          {
            key
          } = inputs;
        client.get(key, function (err, reply) {
          if (err) return reject(err);
          resolve(reply);
        });
      });

      return exits.success(data);

    } catch (error) {
      return exits.error(error);
    }
  }
};