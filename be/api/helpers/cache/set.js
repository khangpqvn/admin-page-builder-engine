module.exports = {


  friendlyName: 'Set',


  description: 'Hàm đặt dữ liệu tạm',


  inputs: {
    key: { type: 'string', description: 'Khóa dữ liệu', required: true },
    val: { type: 'string', description: 'Giá trị dữ liệu' },
    ttl: { type: 'number', description: 'Thời gian sống của dữ liệu tính theo giây (second)', min: 0 }
  },


  exits: {

    success: {
      description: 'Thành công',
    },

  },
  sync: true,


  fn: function (inputs, exits) {
    let client = sails.helpers.redisClient(),
      { key, val, ttl } = inputs;
    if (ttl) {
      client.set(key, val, 'EX', ttl);
    } else {
      client.set(key, val);
    }
    return exits.success(inputs);
  }
};

