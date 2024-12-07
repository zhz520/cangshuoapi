const db = require('../db/db_config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const trasnsport = require('../db/mail')
const axios = require('axios')
// 注册新用户处理函数
exports.regUser = (req, res) => {
    const userinfo = req.body
    // 查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) return res.cc(err)
        // res.send({ status: 1, message: err.message })
        if (results.length > 0) return res.cc('用户名被占用，请更换其他用户名！')
        // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
        // 用户名可用，继续添加用户到数据库
        // 对密码进行加密处理
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        // 插入新用户
        const sql = 'insert into ev_users set ?'
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            if (err) return res.cc(err)
            // res.send({ status: 1, message: err.message })
            if (results.affectedRows !== 1) return res.cc('注册用户失败！')

            // return res.send({
            // status: 1,
            // message: '注册用户失败！'
            // })
            res.send({
                status: 0,
                message: '注册成功！'
            })
        })
    })
}

// 登录处理函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sql = 'select * from ev_users where username=?'
    db.query(sql, userinfo.username, (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('用户名或密码错误！')

        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) return res.cc('用户名或密码错误！')

        const user = { ...results[0], password: '', user_pic: '' }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        res.send({
            status: 0,
            message: '登录成功！',
            token: 'Bearer ' + tokenStr
        })
    })
}

// 获取用户IP函数
function getClientIp(req) {
    if (!req) return null;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    return ip;
}


// 发送邮件给管理员
exports.sendEmailToAdmin = (req, res) => {
    const { username, subject, html } = req.body
    const mailOptions = {
        from: '2156628804@qq.com',
        to: '14329140@qq.com,44987623@qq.com',
        subject: subject,
        html: html + '<br><br><br>来自：' + username
    }
    const ip = getClientIp(req)
    const sql = 'select * from mail_record where ip=?'
    db.query(sql, ip, (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) {
            db.query('insert into mail_record set ?', { ip: ip, last_sendmail_date: new Date() }, (err, results) => {
                if (err) return res.cc(err)
                sendMail()
            })
        }
        if (results.length > 0) {
            const last_sendmail_date = results[0].last_sendmail_date
            const now = new Date()
            const diff = now.getTime() - last_sendmail_date.getTime()
            if (diff < 1000 * 60 * 60 * 24) {
                res.send({
                    status: 1,
                    message: '24小时内只能发送一次邮件！'
                })
            }
            if (diff >= 1000 * 60 * 60 * 24) {
                db.query('update mail_record set last_sendmail_date=? where ip=?', [new Date(), ip], (err, results) => {
                    if (err) return res.cc(err)
                    sendMail()
                })

            }
        }
    })
}

async function sendMail() {
    try {
        await trasnsport.sendMail(mailOptions)
        res.send({
            status: 0,
            message: '邮件发送成功！'
        })
    } catch (error) {
        res.send({
            status: 1,
            message: '邮件发送失败！'
        })
    }
}
// 获取王者英雄列表
exports.getHeroList = async (req, res) => {
    try {
        const results = await axios.get('https://pvp.qq.com/web201605/js/herolist.json')
        res.send({
            status: 0,
            message: '获取英雄列表成功！',
            data: results.data
        })
    } catch (error) {
        return res.cc(error)
    }
}
