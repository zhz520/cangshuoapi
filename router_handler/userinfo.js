const db = require('../db/db_config')
const bcypt = require('bcryptjs')

// 获取用户列表
exports.getUserList = (req, res) => {
    const sql = 'select id,username,nickname from ev_users'
    db.query(sql, (err, results) => {
        if (err) return res.send
        if (results.length === 0) return res.send('获取用户列表失败')
        res.send({
            status: 0,
            message: '获取用户列表成功',
            data: results
        })
    })
}

// 获取用户信息
exports.getUserInfo = (req, res) => {
    const sql = 'select id,username,nickname,email,user_pic from ev_users where id=?'
    db.query(sql, req.auth.id, (err, result) => {
        if (err) return res.send(err)
        if (result.length !== 1) return res.send('获取用户信息失败')
        res.send({
            status: 0,
            message: '获取用户信息成功',
            data: result[0]
        })
    })
}
// 更新用户信息
exports.updateUserInfo = (req, res) => {
    const sql = 'update ev_users set nickname=?,email=? where id=?'
    db.query(sql, [req.body.nickname, req.body.email, req.auth.id], (err, results) => {
        if (err) return res.send(err)
        if (results.affectedRows !== 1) return res.send('更新用户信息失败')
        res.send({
            status: 0,
            message: '更新用户信息成功'
        })
    })
}

// 更新用户密码
exports.updatePassword = (req, res) => {
    const sql = 'select * from ev_users where id=?'
    db.query(sql, req.auth.id, (err, results) => {
        if (err) return res.send(err)
        if (results.length !== 1) return res.send('用户不存在')

        const compareResult = bcypt.compareSync(req.body.oldpassword, results[0].password)
        if (!compareResult) return res.send('原密码错误')

        const sql2 = 'update ev_users set password=? where id=?'
        const newpassword = bcypt.hashSync(req.body.newpassword, 10)
        db.query(sql2, [newpassword, req.auth.id], (err, results) => {
            if (err) return res.send(err)
            if (results.affectedRows !== 1) return res.send('更新密码失败')
            res.send({
                status: 0,
                message: '更新密码成功'
            })
        })
    })
}

// 更新用户头像
exports.updateAvatar = (req, res) => {
    const sql = 'update ev_users set user_pic=? where id=?'
    db.query(sql, [req.body.avatar, req.auth.id], (err, results) => {
        if (err) return res.send(err)
        if (results.affectedRows !== 1) return res.send('更新头像失败')
        res.send({
            status: 0,
            message: '更新头像成功'
        })
    })
}