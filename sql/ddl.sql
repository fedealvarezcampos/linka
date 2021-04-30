CREATE DATABASE IF NOT EXISTS linka_db;

--@block
USE linka_db;


CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `UUID` VARCHAR(100) DEFAULT NULL,
    `username` varchar(20) NOT NULL,
    `email` varchar(50) NOT NULL,
    `password` varchar(100) NOT NULL,
    `bio` varchar(255) DEFAULT NULL,
    `avatar` VARCHAR(150) DEFAULT NULL,
    `url_site` VARCHAR(100) DEFAULT NULL,
    `url_twitter` VARCHAR(100) DEFAULT NULL,
    `url_instagram` VARCHAR(100) DEFAULT NULL,
    `reg_date` DATETIME,
    `edit_date` DATETIME,
    `active` BOOLEAN,
    PRIMARY KEY (`id`)
);

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `prev_img` varchar(255) DEFAULT NULL,
  `prev_txt` varchar(255) DEFAULT NULL,
  `views` int DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `created_date` DATETIME,
  `mod_date` DATETIME,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);

CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `text` varchar(511) NOT NULL,
  `created_date` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE
);