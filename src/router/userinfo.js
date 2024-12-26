const express = require('express')
const userinfo_handler = require('../router_handler/userinfo')
const expressjoi = require('@escook/express-joi')
const { update_userinfo_schema, update_password_schema, update_avatar_schema } = require('../schems/user')
const router = express.Router()

// 获取用户列表
router.get('/userlist', userinfo_handler.getUserList)

// 获取用户信息
router.get('/userinfo', userinfo_handler.getUserInfo)

// 更新用户信息
router.post('/userinfo', expressjoi(update_userinfo_schema), userinfo_handler.updateUserInfo)

// 更新密码
router.post('/updatepwd', expressjoi(update_password_schema), userinfo_handler.updatePassword)

// 更新头像
router.post('/update/avatar', expressjoi(update_avatar_schema), userinfo_handler.updateAvatar)



module.exports = router