const request = require('request');
module.exports = {


  friendlyName: 'Request',


  description: 'Gọi các hàm http request',


  inputs: {
    options: {
      type: 'ref',
      description: 'Định nghĩa các thông tin gửi request',
      example: `{
      uri: 'http://google.com.vn',
      method: 'POST',
      headers: { "content-type": "application/json" },
      body: JSON.stringify({name: 'Walter'})
  }`}
  },


  exits: {

    success: {
      description: 'Dữ liệu từ http request',
    },

  },


  fn: async function (inputs, exits) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    let { options } = inputs;
    options = Object.assign({},options,{strictSSL: false})
    let rs = await new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        // log.info({ error, body })
        if (error) return reject(error)
        try {
          body = JSON.parse(body)
        } catch (error) {

        }
        if (response && response.statusCode == 200) {
          return resolve(body);
        }
        return reject(body)
      });
    });
    return exits.success(rs);
  }
};

