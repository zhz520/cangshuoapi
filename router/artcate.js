const express = require('express')

const router = express.Router()

const expressjoi = require('@escook/express-joi')

const {
	add_cate_schema,
	delete_cate_schema,
	get_cate_schema,
	update_cate_schema
} = require('../schems/artcate.js')

const artcate_handler = require('../router_handler/artcate.js')



// 获取文章分类列表数据
router.get('/cates', artcate_handler.getArtCates)

// 新增文章分类
router.post('/addcates', expressjoi(add_cate_schema), artcate_handler.addArtCates)

// 删除文章分类
router.get('/deletecate/:id', expressjoi(delete_cate_schema), artcate_handler.deleteArtCateById)

// 根据 id 获取文章分类数据
router.get('/cates/:id', expressjoi(get_cate_schema), artcate_handler.getArtCateById)

// 根据 id 更新文章分类数据
router.post('/updatecate', expressjoi(update_cate_schema), artcate_handler.updateArtCateById)

module.exports = router