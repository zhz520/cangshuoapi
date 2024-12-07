const express = require('express')
const app = express()
const joi = require('joi')
const expressjwt = require('express-jwt')
const config = require('./config')
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})
app.use(express.json())
// 只能处理 application/json 编码的内容
app.use(express.urlencoded({
	extended: false
}))
// 只能处理 application/x-www-form-urlencoded 编码的内容

app.use((req, res, next) => {
	res.cc = function (err, status = 1) {
		res.send({
			status,
			message: err instanceof Error ? err.message : err
		})
	}
	next()
})

app.use(expressjwt.expressjwt({
	secret: config.jwtSecretKey,
	algorithms: ['HS256']
}).unless({
	path: [/^\/api\//]
}))

// 用户注册登录模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 用户信息模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 文章分类模块
const artcateRouter = require('./router/artcate.js')
app.use('/my/article', artcateRouter)

// 文章管理模块
const articleRouter = require('./router/article.js')
app.use('/my/article', articleRouter)


app.use((err, req, res, next) => {
	if (err instanceof joi.ValidationError) return res.cc(err)
	if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
	res.cc(err)
	next()
})

app.listen(8089, () => {
	console.log("http://localhost:8089");
})