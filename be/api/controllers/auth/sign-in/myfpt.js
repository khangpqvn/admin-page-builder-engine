const jwt = require('jwt-simple');
module.exports = {


  friendlyName: 'Myfpt',


  description: 'Myfpt sign in.',


  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    let res = this.res;
    let req = this.req;

    try {
      var secret = Conf.get("MYFPT_JWT_SECRET") || '';
      var myfptTokenExp = Conf.get("MYFPT_TOKEN_TIMEOUT") || 30;

      var decoded = jwt.decode(inputs.token, secret);
      if (moment(decoded.iat*1000).add(myfptTokenExp, 'minutes').valueOf() < moment().valueOf()) {
        return res.unauthorized({
          message: sails.__("Phiên làm việc hết hạn!")
        })
      }
      let auth = await Auth.findOne({
        key: decoded.email.toLowerCase(),
        type: 'myfpt'
      });
      if (!auth) {
        let user = await User.create({
          name: decoded.fullname||"",
          email: decoded.email.toLowerCase(),
          userType: Conf.get('MY_FPT_USERTYPE')
        }).fetch();
        // let user = await User.create(tmp).fetch() //.usingConnection(db);
        try {
          auth = await Auth.create({
            key: decoded.email.toLowerCase(),
            type: 'myfpt',
            user: user.id,
            payload: decoded
          }).fetch();
        } catch (error) {
          await User.destroy({
            id: user.id
          })
          throw error;
        }
      } else {
        await Auth.updateOne({
          id: auth.id
        }).set({
          payload: decoded
        })
      }
      let ret = await Auth.login(null, null, 'myfpt', auth.id);
      if (ret.status) {
        ret = Object.assign({}, ret.obj);
        ret.token = sails.helpers.jwt.generate(ret, (Conf.get('TTL_TOKEN')) || 0); //0 = life time
        User.removeUneccessaryValue(ret.user);
        Auth.removeUneccessaryValue(ret.auth);
        UserType.removeUneccessaryValue(ret.user.userType);
        return exits.success(ret);
      } else {
        return res.unauthorized({
          message: ret.message
        });
      }
    } catch (error) {
      return this.res.serverError(error);
    }


  }


};