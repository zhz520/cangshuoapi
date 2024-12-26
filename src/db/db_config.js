const mysql = require('mysql')

const db = mysql.createPool({
    host: 'localhost',
    // 数据库地址
    user: 'root',
    // 用户名
    password: '123456',
    // 用户密码
    database: 'my_db_01',
    // 数据库名称
    connectionLimit: 10,
    // 连接池中最大的连接数量
    queueLimit: 0
    // 当连接池中没有可用连接且连接池已满时，新的连接请求是否排队等待
})
db.on('error', err => {
    console.log('数据库连接失败', err)
})

module.exports = db