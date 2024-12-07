const nodemail = require('nodemailer')

const trasnsport = nodemail.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: '1234444444@qq.com', //你的邮箱
        pass: 'dsdsdsasd',  //授权码 
    }
})
module.exports = trasnsport