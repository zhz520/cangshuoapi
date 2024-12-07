# 介绍

介绍：基于 node.js + express + mysql 的接口项目

## 参数配置

1. 修改 config.js 中的配置
2. 修改 mail.js 中的配置

## 启动

初始化项目

```bash
npm install
```

启动项目(开放 8089 端口,可在 config.js 中修改)

```bash
node app.js
```

## 数据库导入

1. 下载 apicangshuo.sql 文件
2. 导入数据库
3. mysql 版本：5.6.50 以上

## 项目结构

```
├── db  // 数据库
│   ├── apicangshuo.sql  // 数据库文件
│   ├── db_config.js  // 数据库配置
│   └── mail.js  // 邮箱配置
├── router  // 路由
│   ├── artcate.js  // 文章分类路由
│   ├── article.js  // 文章路由
│   └── user.js  // 用户路由
│   └── userinfo.js  // 用户信息路由
├── router_handler  // 路由处理函数
│   ├── artcate.js  // 文章分类路由处理函数
│   ├── article.js  // 文章路由处理函数
│   └── user.js  // 用户路由处理函数
│   └── userinfo.js  // 用户信息路由处理函数
├── schems  // 验证规则
│   ├── artcate.js  // 文章分类的验证规则
│   └── user.js  // 用户的验证规则
├── app.js  // 入口文件
├── config.js  // 配置文件
├── package-lock.json  // 项目依赖
├── package.json  // 项目依赖
└── README.md  // 项目介绍
```

## 接口文档

1. [接口文档](https://apidoc.cangshuow.com)
2. [github](https://github.com/zhz520/cangshuoapi)

## 功能

1. 用户注册、登录、修改密码、修改信息
2. 文章分类的增删改查
3. 文章的增删改查

## 联系方式

1. 邮箱：14329140@qq.com

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途，否则后果自负。
