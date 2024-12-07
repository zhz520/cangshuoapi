const express = require('express')

const router = express.Router()

const user_handlers = require('../router_handler/user')

const expressJoi = require('@escook/express-joi')

const { reg_login_schema, send_email_schema } = require('../schems/user')
// 注册新用户
router.post('/register', expressJoi(reg_login_schema), user_handlers.regUser)
// 登录
router.post('/login', expressJoi(reg_login_schema), user_handlers.login)
// 发送邮件给管理员
router.post('/sendEmailToAdmin', expressJoi(send_email_schema), user_handlers.sendEmailToAdmin)
// 获取王者英雄列表
router.get('/getHeroList', user_handlers.getHeroList)


module.exports = router