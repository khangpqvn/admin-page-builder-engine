module.exports = {


  friendlyName: 'Gps distance',


  description: '',


  inputs: {
    lat1: { type: 'number', description: 'Sô latitude 1', required: true },
    lon1: { type: 'number', description: 'Sô longitude 1', required: true },
    lat2: { type: 'number', description: 'Sô latitude 2', required: true },
    lon2: { type: 'number', description: 'Sô longitude 2', required: true },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },
  sync: true,

  fn: function (inputs, exits) {
    let { lat1, lat2, lon1, lon2 } = inputs;
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return exits.success(dist); //kilometer
  }
};

