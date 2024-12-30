const db = require('../db/db_config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const trasnsport = require('../db/mail')
const axios = require('axios')
const https = require('https')
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
    // 确保生成合法的 IP 地址
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// 蓝奏直链解析
exports.getLanZouLink = async (req, res) => {
    const { url, type, pwd } = req.query;

    if (!url) return res.cc('请输入正确的链接！');


    if (!pwd || pwd == null) {
        try {
            const iframeSrc = await getLanZouIframeSrc(url);
            if (!iframeSrc) return res.status(400).json({ status: 1, message: '解析失败！' });

            const urlObj = await getLanZouP(url, iframeSrc);
            if (!urlObj) return res.status(400).json({ status: 1, message: '解析失败！' });

            await getLanZouLink(url, urlObj, res, type);
        } catch (error) {
            return res.cc(error);
        }
    }
    if (pwd) {
        const urlObj = await getHasPwdLanZouP(url, pwd, res, type);
        if (!urlObj) return res.status(400).json({ status: 1, message: '解析失败！' });
        await getHasPwdLanZouLink(url, urlObj, res, type, pwd);
    }
};

// 有密码
async function getHasPwdLanZouP(url) {
    const config = {
        headers: { 'User-Agent': USER_AGENT, 'X-Forwarded-For': randomIP() },
        https: { rejectUnauthorized: false }  // 忽略SSL证书验证
    };
    try {
        const results = await axios.get(url, config);
        const signMatch = results.data.match(/skdklds = '(.*?)'/)[1]
        const urlp = results.data.match(/url\s*:\s*'(\/ajaxm\.php\?file=\d+)'/)[1]
        return signMatch && urlp ? { signMatch, urlp } : null;
    } catch (error) {
        throw error;
    }
}
async function getHasPwdLanZouLink(url, urlObj, res, type, pwd) {
    const { signMatch, urlp } = urlObj;
    const urlpFull = 'https://www.lanzouw.com' + urlp;
    try {
        const results = await axios({
            method: 'post',
            url: urlpFull,
            data: {
                sign: signMatch,
                action: 'downprocess',
                p: pwd,
                kd: 1
            },
            headers: {
                'User-Agent': USER_AGENT,
                'X-Forwarded-For': randomIP(),
                'Referer': url,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            https: { rejectUnauthorized: false }
        })
        const data = results.data;
        const resUrl = data.dom + '/file/' + data.url
        if (type === "JSON" || type === "json" || type === null || !type) {
            if (data.zt === 0) {
                res.status(200).json({
                    status: 1,
                    message: data.inf,
                })
            }
            if (data.zt === 1) {
                res.status(200).json({
                    status: 0,
                    message: '解析成功！',
                    data: {
                        url: resUrl,
                        filename: data.inf
                    }
                })
            }
        } else if (type === "down") {
            if (data.zt === 0) {
                res.status(200).json({
                    status: 1,
                    message: data.inf,
                })
            }
            if (data.zt === 1) {
                res.redirect(302, resUrl)
            }
        } else {
            res.status(400).json({
                status: 1,
                message: '检查参数！'
            })
        }

    } catch (error) {
        throw error;
    }

}

// 无密码
async function getLanZouIframeSrc(url) {
    const config = {
        headers: { 'User-Agent': USER_AGENT, 'X-Forwarded-For': randomIP() },
        https: { rejectUnauthorized: false }  // 忽略SSL证书验证
    };

    try {
        const results = await axios.get(url, config);
        const iframeSrc = results.data.match(/<iframe.*?src="(.*?)"/)[1];
        return iframeSrc || null;
    } catch (error) {
        throw '链接解析失败！' + error;
    }
}

async function getLanZouP(url, iframeSrc) {
    const pUrl = url + iframeSrc;
    const config = {
        headers: { 'User-Agent': USER_AGENT, 'X-Forwarded-For': randomIP() },
        https: { rejectUnauthorized: false }
    };

    try {
        const results = await axios.get(pUrl, config);
        const signMatch = results.data.match(/sign':'(.*?)'/)[1];
        const urlP = results.data.match(/url\s*:\s*'(\/ajaxm\.php\?file=\d+)'/)[1];
        return signMatch && urlP ? { signMatch, urlP, pUrl } : null;
    } catch (error) {
        throw error;
    }
}

async function getLanZouLink(url, urlObj, res, type) {
    const { signMatch, urlP, pUrl } = urlObj;
    const urlPFull = 'https://www.lanzouw.com' + urlP;
    const config = {
        headers: {
            'User-Agent': USER_AGENT,
            'X-Forwarded-For': randomIP(),
            'Referer': pUrl,
            'Content-Type': 'multipart/form-data'
        },
        https: { rejectUnauthorized: false }
    };

    try {
        const results = await axios.post(urlPFull, {
            sign: signMatch,
            action: 'downprocess',
            signs: '?ctdf',
        }, config);
        const urlLink = results.data.dom + "/file/" + results.data.url;
        if (!urlLink) return res.status(400).json
        if (type === "json" || type === "JSON" || type === null || !type) {
            res.status(200).json(
                { status: 0, message: '解析成功！', data: { urlLink } }
            );
        } else if (type === "down") {
            res.redirect(302, urlLink)
        } else {
            res.status(400).json({ status: 1, message: '检查参数！' });
        }
    } catch (error) {
        throw error;
    }
}



// 快手链接解析
exports.getKuaishouLink = async (req, res) => {
    const { url, type } = req.query;
    if (!url) return res.cc('请输入正确的链接！');

    try {
        const finalUrl = await getFinalUrl(url);
        if (!finalUrl) return res.status(400).json({ status: 1, message: '检查参数！' });

        await getKuaishouLinks(finalUrl, type, url, res);
    } catch (error) {
        console.error(`Error in getKuaishouLink: ${error.message}`);
        res.status(500).json({ status: 1, message: '服务器内部错误！' });
    }
};

async function getFinalUrl(url) {
    try {
        const chenzhongtech = await axios.get(url, {
            headers: {
                "x-forwarded-for": randomIP(),
                "User-Agent": "Mozilla/5.0 (iphone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "zh-CN,zh;q=0.9",
                // "Referer": "https://www.kuaishou.com/"
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        return chenzhongtech.request.res.responseUrl;
    } catch (error) {
        console.error(`Error in getFinalUrl: ${error.message}`);
        throw error;
    }
}

async function getKuaishouLinks(urlPFull, type, url, res) {
    try {
        const response = await axios.get(urlPFull, {
            headers: {
                "x-forwarded-for": randomIP(),
                "User-Agent": "Mozilla/5.0 (iphone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "zh-CN,zh;q=0.9",
                // "Referer": "https://www.kuaishou.com/"
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        const chenzongtechHtml = response.data;

        let substring = "representation";
        let index = chenzongtechHtml.indexOf(substring);
        if (index !== -1) {
            let result = chenzongtechHtml.substring(index + substring.length + 2, chenzongtechHtml.length - 2);

            let regex = /"backupUrl":\["([^"]+)"\]/g;
            let matches;
            let backupUrls = [];
            while ((matches = regex.exec(result)) !== null) {
                backupUrls.push(matches[1]);
            }

            const urlLink = handleUrl(backupUrls, url);
            if (!urlLink) return res.status(200).json({ status: 0, message: '解析失败！', data: { urlLink: "无效链接" } });

            if (type === "json" || type === "JSON" || type === null || !type) {
                res.status(200).json({ status: 0, message: '解析成功！', data: { urlLink } });
            } else if (type === "down") {
                res.redirect(302, urlLink);
            } else {
                res.status(400).json({ status: 1, message: '检查参数！' });
            }
        } else {
            res.status(200).json({ status: 0, message: '解析失败！', data: { urlLink: "未知错误" } });
        }
    } catch (error) {
        console.error(`Error in getKuaishouLinks: ${error.message}`);
        throw error;
    }
}

function handleUrl(results, url) {
    if (url.startsWith("https://www")) {
        return results[1].replace(/\\/g, "").replace(/u002F/g, "/");
    } else if (url.startsWith("https://v")) {
        return results[0].replace(/\\/g, "").replace(/u002F/g, "/");
    }
    return null;
}