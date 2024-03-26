module.exports = {


  friendlyName: 'Refresh conf',


  description: 'Tải lại dữ liệu cấu hình hệ thống từ csdl',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs, exits) {
    try {
      await sails.helpers.cache.refreshCache();
      return exits.success({ message: sails.__('Đồng bộ cache thành công') });
    } catch (err) {
      return this.res.serverError(err);
    }
  }


};
