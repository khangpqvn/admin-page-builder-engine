const _ = require('@sailshq/lodash');
let checkRoleEqual = function (role1, role2) {

  return JSON.stringify(role1.sort((a, b) => a - b)) ===
    JSON.stringify(role2.sort((a, b) => a - b));
}
module.exports = {


  friendlyName: 'Check permission on update user',


  description: '',


  inputs: {
    sessionUser: {
      type: 'ref',
      required: true
    },
    modifyUserId: {
      type: 'number',
      required: true,
      min: 1
    },
    newModifyUserTypeId: {
      type: 'number',
      defaultsTo: 0,
      min: 0,
      description: 'trong trường hợp phân userType mới cho người dùng thì check xem userType này có được phép phân cho người dùng không'
    },
    newModifyUserRoleId: {
      type: 'ref',
      description: 'trong trường hợp phân userType mới cho người dùng thì check xem Role mới này có được phép phân cho người dùng không',
      defaultsTo: []
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
        modifyUserId,
        sessionUser,
        newModifyUserTypeId,
        newModifyUserRoleId
      } = inputs;

      let modifyUser = await User.findOne({
        id: modifyUserId,
        isDelete: false
      });
      let sessionUserType = sessionUser.userType;
      if (typeof sessionUserType === 'number') {
        sessionUserType = await UserType.findOne({
          id: sessionUserType
        });
      }
      if (!sessionUserType || typeof sessionUserType !== 'object' || !modifyUser) {
        //Người dùng đang đăng nhập/người dùng cần cập nhật không xác định được đủ thông tin cần thiết
        return exits.success(false);
      }


      if (newModifyUserRoleId.length && !checkRoleEqual(newModifyUserRoleId, modifyUser.roleId) && _.intersection(sessionUserType.ruleIgnoreRole, newModifyUserRoleId).length) {
        //role mới và role cũ khác nhau và role mới có phần nằm trong danh sách cấm cấp quyền của người dùng đang đăng  nhập
        return exits.success(false);
      }
      if (sessionUserType.ruleOnlyViewCreatedBy && modifyUser.createdBy !== sessionUser.id) {
        //NGười dùng đang đăng nhập chỉ được phép sửa thông tin những người dùng do chính mình tạo ra. 
        // console.log({ modifyUser, sessionUser })
        return exits.success(false);
      }
      if (!newModifyUserTypeId) {
        newModifyUserTypeId = modifyUser.userType;
      }
      if (newModifyUserTypeId !== modifyUser.userType && !sessionUser.userType.ruleViewUserType.includes(newModifyUserTypeId)) {
        //Quyền cấp mới nắm ngoài quyền người đăng nhập được phép cấp và quyền cấp mới khác quyền cũ
        return exits.success(false);
      }
      return exits.success(true);

    } catch (error) {
      log.error(error);
      return exits.success(false);
    }

  }



};