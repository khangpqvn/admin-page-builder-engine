const _ = require('@sailshq/lodash');

module.exports = {


  friendlyName: 'Check permission on create user',


  description: '',


  inputs: {
    sessionUser: {
      type: 'ref',
      required: true
    },
    userTypeId: {
      type: 'number',
      min: 0,
      required: true,
      description: 'check xem userType này có được phép cho người dùng phân quyền cho người khác không'
    },
    userRoleId: {
      type: 'ref',
      defaultsTo: [],
      description: 'Role sẽ phân thêm cho người dùng ngoài group role trong userTypeId'
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      let {
        userRoleId,
        sessionUser,
        userTypeId
      } = inputs;

      let sessionUserType = sessionUser.userType;
      if (typeof sessionUserType === 'number') {
        sessionUserType = await UserType.findOne({
          id: sessionUserType
        });
      }

      if (!sessionUserType || typeof sessionUserType !== 'object') {
        //Người dùng đang đăng nhập không xác định được hạng người dùng
        return exits.success(false);
      }

      if (!userTypeId || !sessionUserType.ruleViewUserType.includes(userTypeId)) {
        // check buộc người dùng tạo mới phải thuộc 1 dạng người dùng nào đó để có 1 list role default
        return exits.success(false);
      }
      if (_.intersection(sessionUserType.ruleIgnoreRole, userRoleId).length) {
        //check xem role add thêm có hợp lệ không. Hợp lệ là các role nằm ngoài ruleIgnoreRole
        return exits.success(false);
      }

      return exits.success(true);

    } catch (error) {
      log.error(error);
      return exits.success(false);
    }
  }


};