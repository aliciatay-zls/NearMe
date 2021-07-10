DROP DATABASE IF EXISTS `locationsDB`;
CREATE DATABASE `locationsDB`;
USE `locationsDB`;

CREATE TABLE `categories` (
	`CategoryId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`CategoryName` VARCHAR(100) NOT NULL,
    `CodeName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`CategoryId`),
    INDEX (`CodeName`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `brand_categories` (
	`BrandId` INT UNSIGNED NOT NULL,
    `CategoryId` INT UNSIGNED NOT NULL,
    INDEX (`BrandId`),
    INDEX (`CategoryId`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `brands` (
	`BrandId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`BrandName` VARCHAR(100) NOT NULL,
    `ShortName` CHAR(3) NOT NULL,
    PRIMARY KEY (`BrandId`),
    INDEX (`ShortName`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `outlets` (
	`OutletId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`OutletName` VARCHAR(100) NOT NULL,
    `Latitude` FLOAT NOT NULL,
    `Longitude` FLOAT NOT NULL,
    `Postal` CHAR(6) NOT NULL,
    `Contact` CHAR(8) NOT NULL,
    `Closing` VARCHAR(255) NOT NULL,
    `BrandId` INT unsigned,
    PRIMARY KEY (`OutletId`),
    FOREIGN KEY (`BrandId`) REFERENCES `brands`(`BrandId`) ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
