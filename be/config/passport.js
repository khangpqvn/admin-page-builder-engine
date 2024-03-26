const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const moment = require('moment');
const globalVar = require('./globals').globals;


var opts = {};
opts.jwtFromRequest = ExtractJwt.fromExtractors(
  [ExtractJwt.fromUrlQueryParameter("authentication_token"),
  // ExtractJwt.fromHeader("authentication_token"),
  ExtractJwt.fromAuthHeaderAsBearerToken()]
); //ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = globalVar.JWT_TOKEN_SECRET;

passport.use(new JwtStrategy(opts, (payload, done) => {
  if (payload.exp && payload.exp < moment().valueOf()) {
    payload.message = sails.__('Session time out!');
    return done(null, false, payload);
  }
  return done(null, true, payload);
}));
