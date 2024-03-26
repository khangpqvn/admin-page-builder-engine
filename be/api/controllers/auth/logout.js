module.exports = {


  friendlyName: 'Logout',


  description: 'Logout auth.',


  inputs: {
    fcmToken: { type: 'string' }
  },


  exits: {

  },


  fn: async function (inputs,exits)  {
    let req = this.req;
    let res = this.res;
    try {
      if (inputs.fcmToken) {
        let currentUser = await User.findOne({ id: req.user.id });

        if (currentUser && currentUser.fcmToken.length) {
          let listPushToken = currentUser.fcmToken;
          listPushToken = listPushToken.filter(v => v !== inputs.fcmToken);
          // await Notice.update({token: currentUser.pushNoticeToken, isPush: false}).set({isPush: true});
          await User.updateOne({ id: currentUser.id }).set({ fcmToken: listPushToken });
        }
      }
      return exits.success({ message: sails.__('Đăng xuất thành công') });
    } catch (e) {
      return res.serverError(e);
    }

  }


};