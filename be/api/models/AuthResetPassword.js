/**
 * AuthResetPassword.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  //Đã Chuyển qua dùng redis
  attributes: {
    auth: {
      model: 'auth'
    },
    key: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      maxLength: 10,
      required: true
    },
    token: {
      type: 'string',
      unique: true
    },
    expiredAt: {
      type: 'number'
    },
    isUse: {
      type: 'boolean',
      defaultsTo: false
    }
  },

};