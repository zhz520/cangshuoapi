const joi = require('joi')

// 用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(30).required()
const password = joi.string().pattern(/^[\S]{3,12}$/).required()

const nickname = joi.string().min(1).max(30).required()
const emaily = joi.string().email().required()

const avatar = joi.string().dataUri().required()
// 举例：data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA
// 邮件主题
const subject = joi.string().required()
// 邮件内容
const html = joi.string().required()

// 用户信息的验证规则
exports.update_userinfo_schema = {
    body: {
        nickname,
        email: emaily
    }
}

// 注册和登录表单的验证规则
exports.reg_login_schema = {
    body: {
        username,
        password
    }
}

// 更新密码的验证规则
exports.update_password_schema = {
    body: {
        oldpassword: password,
        newpassword: joi.not(joi.ref('oldpassword')).concat(password)
    }
}
// 更新头像的验证规则
exports.update_avatar_schema = {
    body: {
        avatar
    }
}
// 发送邮件的验证规则
exports.send_email_schema = {
    body: {
        subject,
        html,
        username: joi.string().required()
    }
}