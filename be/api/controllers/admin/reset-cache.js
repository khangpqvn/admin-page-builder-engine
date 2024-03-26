module.exports = {


  friendlyName: 'Reset cache',


  description: '',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs,exits)  {
    let res = this.res;
    try {
      console.log("Reset cache");
      let promises = [];
      for (var index in sails.models) {
        let model = sails.models[index];
        if (model.enableCache && model.setCache) {
          await model.setCache();
        }
      }
      return exits.success({
        message: sails.__('Cập nhật cache xong!')
      });
    } catch (err) {
      return res.serverError(err);
    }

  }


};
