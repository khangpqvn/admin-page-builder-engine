module.exports = {


    friendlyName: 'Query',
    type: 'backend',

    description: 'Lấy thông tin cần thiết hiển thị trên trang quản trị',


    inputs: {
        input: { type: 'string', description: 'text input', required: true }
    },


    exits: {
        success: {
            statusCode: 200
        }
    },


    fn: async function (inputs, exits) {
        let rs = await sails.getDatastore().sendNativeQuery(inputs.input);
        return exits.success(rs);

    }
};
