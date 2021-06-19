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
#    `BrandId` 1,
#    FOREIGN KEY (BrandId)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOAD DATA INFILE 'data.csv' 
INTO TABLE `outlets`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

SELECT * FROM `outlets`;

SET GLOBAL log_bin_trust_function_creators = 1;
SELECT DISTANCE( 37.7756, -122.4193, 40.71448, -74.00598, 'KM' );

# 1.3104680812609208, 103.86246226812166
SELECT DISTANCE( 1.3104680812609208, 103.86246226812166, 1.327351,103.678836, 'KM' );

select outlets.*, DISTANCE(1.3104680812609208, 103.86246226812166, outlets.Latitude, outlets.Longitude, 'KM' ) as distance 
from outlets
order by distance ASC;

