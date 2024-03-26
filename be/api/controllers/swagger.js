var isEnable = true;

var swaggerDefinition = {
  info: {
    title: 'API_DOCUMENT',
    description: 'APIs listing for ' + require('../../package.json').name + ' Project',
    version: '1.0.0',
    contact: {
      email: 'khangpq.vn@gmail.com',
      phone: '0981604050'
    }
  },
  swagger: "2.0",
  basePath: '/',
  definitions: {},
  responses: {},
  parameters: {},
  securityDefinitions: {},
  tags: [],
  path: {}
};


module.exports = function (req, res) {
  if (isEnable) {
    res.json(swaggerSpec);
  } else {
    res.json(swaggerDefinition);
  }
};