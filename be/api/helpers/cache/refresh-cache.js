module.exports = {


  friendlyName: 'Refresh cache',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      console.log("RefreshCache");
      let promises = [];
      for (var index in sails.models) {
        let model = sails.models[index];
        if (model.refreshCache) {
          promises.push(model.refreshCache());
        }
      }
      Promise.all(promises).then(() => {
        console.log("Done RefreshCache");
      }).catch(err => {
        log.error(err);
        console.log("Done RefreshCache with error", String(err));
      });

      return exits.success({
        message: sails.__('Cập nhật cache xong!')
      });
    } catch (err) {
      return exits.error(err);
    }
  }


};