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
                sendMail(res, mailOptions)
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
                    sendMail(res, mailOptions)
                })

            }
        }
    })
}

async function sendMail(res, mailOptions) {
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
        res.status(200).json({
            status: 0,
            message: '获取英雄列表成功！',
            data: results.data
        })
    } catch (error) {
        return res.cc(error)
    }
}


// 默认用户代理
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

// 随机IP函数
function randomIP() {
    const ip = []
    for (let i = 0; i < 4; i++) {
        ip.push(Math.floor(Math.random() * 256))
    }
    return ip.join('.')
}

// 蓝奏直链解析
exports.getLanZouLink = async (req, res) => {
    const { url } = req.query;

    if (!url) return res.cc('请输入正确的链接！');

    try {
        const iframeSrc = await getLanZouIframeSrc(url);
        if (!iframeSrc) return res.status(400).json({ status: 1, message: '解析失败！' });

        const urlObj = await getLanZouP(url, iframeSrc);
        if (!urlObj) return res.status(400).json({ status: 1, message: '解析失败！' });

        await getLanZouLink(url, urlObj, res);
    } catch (error) {
        return res.cc(error);
    }
};

async function getLanZouIframeSrc(url) {
    try {
        const results = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT, 'X-Forwarded-For': randomIP() },
            https: { rejectUnauthorized: false }
        });
        const iframeSrc = results.data.match(/<iframe.*?src="(.*?)"/)[1];
        return iframeSrc || null;
    } catch (error) {
        throw '链接解析失败！' + error;
    }
}

async function getLanZouP(url, iframeSrc) {
    const pUrl = url + iframeSrc;
    try {
        const results = await axios.get(pUrl, {
            headers: { 'User-Agent': USER_AGENT, 'X-Forwarded-For': randomIP() },
            https: { rejectUnauthorized: false }
        });
        const signMatch = results.data.match(/sign':'(.*?)'/)[1];
        const urlP = results.data.match(/url\s*:\s*'(\/ajaxm\.php\?file=\d+)'/)[1];
        return signMatch && urlP ? { signMatch, urlP, pUrl } : null;
    } catch (error) {
        throw error;
    }
}

async function getLanZouLink(url, urlObj, res) {
    const { signMatch, urlP, pUrl } = urlObj;
    const urlPFull = 'https://www.lanzouw.com' + urlP;
    try {
        const results = await axios.post(urlPFull, {
            sign: signMatch,
            action: 'downprocess',
            signs: '?ctdf',
        }, {
            headers: {
                'User-Agent': USER_AGENT,
                'X-Forwarded-For': randomIP(),
                'Referer': pUrl,
                'Content-Type': 'multipart/form-data'
            },
            https: { rejectUnauthorized: false }
        });
        const urlLink = results.data.dom + "/file/" + results.data.url;
        res.status(200).json({ status: 0, message: '解析成功！', data: { urlLink } });
    } catch (error) {
        throw error;
    }


}
