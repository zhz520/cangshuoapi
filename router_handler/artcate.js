const db = require('../db/db_config.js')
// 获取文章分类的列表数据
exports.getArtCates = (req, res) => {
	const sql = 'select * from ev_article_cate where is_delete=0 order by id asc'
	db.query(sql, (err, result) => {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.log('数据库断开连接')
			db.end()
			db.connect()
		}
		if (err) return res.send(err)
		if (result.length === 0) return res.send({
			status: 1,
			message: '获取文章分类列表失败！'
		})
		res.send({
			status: 0,
			message: '获取文章分类列表成功！',
			data: result
		})
	})
}


// 新增文章分类
exports.addArtCates = (req, res) => {
	const sql = 'select * from ev_article_cate where name=? or alias=?'
	db.query(sql, [req.body.name, req.body.alias], (err, results) => {
		if (err) return res.send(err)

		if (results.length === 2) return res.send({
			status: 1,
			message: '分类名称与别名被占用，请更换后重试！'
		})
		if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body
			.alias) return res.send({
				status: 1,
				message: '分类名称与别名被占用，请更换后重试！'
			})
		if (results.length === 1 && results[0].name === req.body.name) return res.send({
			status: 1,
			message: '分类名称被占用，请更换后重试！'
		})
		if (results.length === 1 && results[0].alias === req.body.alias) return res.send({
			status: 1,
			message: '分类别名被占用，请更换后重试！'
		})

		const sql2 = 'insert into ev_article_cate (name,alias) values(?,?)'
		db.query(sql2, [req.body.name, req.body.alias], (err, result) => {
			if (err) return res.send(err)
			if (result.affectedRows !== 1) return res.send({
				status: 1,
				message: '新增文章分类失败！'
			})
			res.send({
				status: 0,
				message: '新增文章分类成功！'
			})
		})
	})
}

// 删除文章分类
exports.deleteArtCateById = (req, res) => {
	const sql = 'update ev_article_cate set is_delete=1 where id = ?'
	db.query(sql, req.params.id, (err, results) => {
		if (err) return res.send(err)
		if (results.affectedRows !== 1) return res.send({
			status: 1,
			message: '删除文章分类失败！'
		})
		res.send({
			status: 0,
			message: '删除文章分类成功！'
		})
	})
}

// 根据id获取文章分类数据
exports.getArtCateById = (req, res) => {
	const sql = 'select * from ev_article_cate where id =?'
	db.query(sql, req.params.id, (err, results) => {
		if (err) return res.send(err)
		if (results.length !== 1) return res.send({
			status: 1,
			message: '获取文章分类数据失败！'
		})
		res.send({
			status: 0,
			message: '获取文章分类数据成功！',
			data: results[0]
		})
	})
}

// 更新文章分类
exports.updateArtCateById = (req, res) => {
	const sql = 'select * from ev_article_cate where id<>? and (name=? or alias=?)'
	db.query(sql, [req.body.id, req.body.name, req.body.alias], (err, results) => {
		if (err) return res.send(err)
		if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试')
		if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body
			.alias) return res.cc('分类名称与别名被占用，请更换后重试')
		if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试')
		if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试')
		const sql2 = 'update ev_article_cate set name=?,alias=? where id=?'
		db.query(sql2, [req.body.name, req.body.alias, req.body.id], (err, results) => {
			if (err) return res.send(err)
			if (results.affectedRows !== 1) return res.send({
				status: 1,
				message: '更新文章分类失败！'
			})
			res.send({
				status: 0,
				message: '更新文章分类成功！'
			})
		})
	})
}