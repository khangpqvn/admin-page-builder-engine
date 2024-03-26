var redis = require("redis"),
  client = redis.createClient(sails.config.datastores.redis);
client.auth(sails.config.datastores.redis.password);
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
  log.error(err);
});
client.on('ready', () => {
  sails.log.info('Redis server is ready!');
})

module.exports = {


  friendlyName: 'Redis Client',


  description: 'Client.',


  inputs: {

  },


  exits: {

    success: {
      description: 'Trả về biến client kết nối redis.',
    },

  },
  sync: true,


  fn: function (inputs, exits) {
    return exits.success(client);
  }


};