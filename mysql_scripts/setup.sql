DROP DATABASE IF EXISTS `locationsDB`;
CREATE DATABASE `locationsDB`;
USE `locationsDB`;

CREATE TABLE `outlets` (
    `OutletId` INT unsigned NOT NULL AUTO_INCREMENT,
	`OutletName` varchar(100) NOT NULL,
    `Latitude` float NOT NULL,
    `Longitude` float NOT NULL,
    `Postal` varchar(6) NOT NULL,
    `Contact` varchar(8) NOT NULL,
    `Closing` varchar(100) NOT NULL,
    PRIMARY KEY (`OutletId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
