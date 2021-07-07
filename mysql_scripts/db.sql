USE `locationsDB`;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/brands.csv' 
INTO TABLE `brands`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2) SET BrandName=@col1, ShortName=@col2;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/outlets_kfc.csv' 
INTO TABLE `outlets`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2, @col3, @col4, @col5, @col6, @col7) SET OutletName=@col1, Latitude=@col2, Longitude=@col3, Postal=@col4, Contact=@col5, Closing=@col6, BrandId=@col7;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/outlets_mcd.csv' 
INTO TABLE `outlets`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2, @col3, @col4, @col5, @col6, @col7) SET OutletName=@col1, Latitude=@col2, Longitude=@col3, Postal=@col4, Contact=@col5, Closing=@col6, BrandId=@col7;

SELECT * FROM `outlets`;

SET SQL_SAFE_UPDATES = 0;

UPDATE `outlets`
SET `BrandId` = 1;

SELECT 
	o.OutletId,
    o.OutletName,
    o.Latitude,
    o.Longitude,
    o.Postal,
    o.Contact,
    o.Closing,
    b.BrandId,
    b.BrandName, 
	DISTANCE(1.3104680812609208, 103.86246226812166, Latitude, Longitude, 'KM' ) AS `distance` 
FROM `outlets` o
INNER JOIN `brands` b USING(BrandId)
WHERE o.BrandId = 1
ORDER BY `distance` ASC;
