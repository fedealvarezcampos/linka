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
    `userSite` VARCHAR(100) DEFAULT NULL,
    `userTW` VARCHAR(100) DEFAULT NULL,
    `userIG` VARCHAR(100) DEFAULT NULL,
    `regDate` DATETIME,
    `editDate` DATETIME,
    `verified` BOOLEAN DEFAULT false,
    PRIMARY KEY (`id`)
);

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `prevImg` varchar(255) DEFAULT NULL,
  `prevIxt` varchar(255) DEFAULT NULL,
  `views` int DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `created_date` DATETIME,
  `modDate` DATETIME,
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);

CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `text` varchar(511) NOT NULL,
  `created_date` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (postId)
    REFERENCES posts(id)
    ON DELETE CASCADE
);
