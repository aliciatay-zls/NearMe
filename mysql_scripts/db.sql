USE `locationsDB`;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/brands.csv' 
INTO TABLE `brands`
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2) SET BrandName=@col1;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/data.csv' 
INTO TABLE `outlets`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2, @col3, @col4, @col5, @col6, @col7) SET OutletName=@col1, Latitude=@col2, Longitude=@col3, Postal=@col4, Contact=@col5, Closing=@col6, BrandId=@col7;

SET SQL_SAFE_UPDATES = 0;
SELECT * FROM `outlets`;
UPDATE `outlets`
SET `BrandId` = 1;

SELECT DISTANCE( 37.7756, -122.4193, 40.71448, -74.00598, 'KM' );

SELECT DISTANCE( 1.3104680812609208, 103.86246226812166, 1.327351,103.678836, 'KM' );

SELECT *, DISTANCE(1.3104680812609208, 103.86246226812166, Latitude, Longitude, 'KM' ) AS `distance` 
FROM `outlets`
ORDER BY `distance` ASC;
