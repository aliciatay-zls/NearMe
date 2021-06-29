DROP DATABASE IF EXISTS `locationsDB`;
CREATE DATABASE `locationsDB`;
USE `locationsDB`;

CREATE TABLE `outlets` (
	`OutletName` varchar(100) NOT NULL,
    `Latitude` float NOT NULL,
    `Longitude` float NOT NULL,
    `Postal` varchar(6) NOT NULL,
    `Contact` varchar(8) NOT NULL,
    `Closing` varchar(100) NOT NULL,
    PRIMARY KEY (`OutletName`)
);
