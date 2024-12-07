-- phpMyAdmin SQL Dump
-- version 4.4.15.10
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2024-12-07 22:37:51
-- 服务器版本： 5.6.50-log
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apicangshuo`
--

-- --------------------------------------------------------

--
-- 表的结构 `ev_articles`
--

CREATE TABLE IF NOT EXISTS `ev_articles` (
  `id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `cover_img` varchar(255) DEFAULT NULL,
  `pub_date` datetime NOT NULL,
  `state` enum('published','draft','archived') NOT NULL DEFAULT 'draft',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:未删除, 1:已删除',
  `cate_id` int(10) unsigned NOT NULL,
  `author` int(10) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_article_cate`
--

CREATE TABLE IF NOT EXISTS `ev_article_cate` (
  `id` int(10) unsigned NOT NULL,
  `name` varchar(191) NOT NULL,
  `alias` varchar(191) NOT NULL,
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:没有删除\n1:已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类数据表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_users`
--

CREATE TABLE IF NOT EXISTS `ev_users` (
  `id` int(11) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_pic` text
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- --------------------------------------------------------

--
-- 表的结构 `mail_record`
--

CREATE TABLE IF NOT EXISTS `mail_record` (
  `ip` varchar(200) NOT NULL,
  `last_sendmail_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮箱最后一次发送时间表';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ev_articles`
--
ALTER TABLE `ev_articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_UNIQUE` (`id`),
  ADD KEY `idx_cate_id` (`cate_id`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_pub_date` (`pub_date`);

--
-- Indexes for table `ev_article_cate`
--
ALTER TABLE `ev_article_cate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_UNIQUE` (`id`),
  ADD UNIQUE KEY `name_UNIQUE` (`name`),
  ADD UNIQUE KEY `alias_UNIQUE` (`alias`);

--
-- Indexes for table `ev_users`
--
ALTER TABLE `ev_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_UNIQUE` (`id`),
  ADD UNIQUE KEY `username_UNIQUE` (`username`);

--
-- Indexes for table `mail_record`
--
ALTER TABLE `mail_record`
  ADD PRIMARY KEY (`ip`(100));

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ev_articles`
--
ALTER TABLE `ev_articles`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_article_cate`
--
ALTER TABLE `ev_article_cate`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_users`
--
ALTER TABLE `ev_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
