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

--@block

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `linkTitle` varchar(255) DEFAULT NULL,
  `linkImg` varchar(512) DEFAULT NULL,
  `linkSite` varchar(255) DEFAULT NULL,
  `linkDesc` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `commented` int DEFAULT NULL,
  `created_date` DATETIME,
  `modDate` DATETIME,
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);

--@block

-- ALTER TABLE posts ADD FULLTEXT(title, description, linkTitle, linkDesc);

CREATE FULLTEXT INDEX searchIndex ON posts(title, description, link, linkTitle, linkDesc);

--@block

CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `text` varchar(511) NOT NULL,
  `parent_comment` int DEFAULT NULL,
  `created_date` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (postId)
    REFERENCES posts(id)
    ON DELETE CASCADE
);

--@block

CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `liked` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (postId)
    REFERENCES posts(id)
    ON DELETE CASCADE
);