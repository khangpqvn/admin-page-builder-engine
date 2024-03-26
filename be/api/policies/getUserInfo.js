const passport = require('passport');

module.exports = async function (req, res, next) {
  let apiVersion = req.headers['api-version'] || req.query['api-version'] || '';

  passport.authenticate('jwt', {
    session: false
  }, async (err, status, payload) => {
    req.user = (payload || {}).user || {};
    req.auth = (payload || {}).auth || {};
    if (apiVersion === 'public') {
      return next();
    }
    if (err) {
      return res.serverError({ err, payload, status });
    }

    if (!status) {
      return res.unauthorized({
        message: payload.message
      });
    } else {
      return next();
    }
  })(req, res);

};
