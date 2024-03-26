module.exports = {
    PASSWORD_REGEX: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{6,}$/, //Mật khẩu phải bao gồm cả chữ và số đồng thời ít nhất 6 ký tự!
    ACCOUNT_REGEX: /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9])+[a-zA-Z0-9]$/, //Tài khoản chứa ký tự không hợp lệ hoặc chưa đủ 3 ký tự!
    ALLOW_LANGUAGE: ['vi', 'en']
}