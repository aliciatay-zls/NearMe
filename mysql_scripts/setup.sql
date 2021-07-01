DROP DATABASE IF EXISTS `locationsDB`;
CREATE DATABASE `locationsDB`;
USE `locationsDB`;

CREATE TABLE `brands` (
	`BrandId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`BrandName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`BrandId`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `outlets` (
	`OutletId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`OutletName` VARCHAR(100) NOT NULL,
    `Latitude` FLOAT NOT NULL,
    `Longitude` FLOAT NOT NULL,
    `Postal` CHAR(6) NOT NULL,
    `Contact` CHAR(8) NOT NULL,
    `Closing` CHAR(100) NOT NULL,
    `BrandId` INT unsigned,
    `BrandName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`OutletId`),
    FOREIGN KEY (`BrandId`) REFERENCES `brands`(`BrandId`) ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
