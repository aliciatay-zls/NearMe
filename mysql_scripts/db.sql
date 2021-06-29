USE `locationsDB`;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/data.csv' 
INTO TABLE `outlets`
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@col1, @col2, @col3, @col4, @col5, @col6, @col7) set OutletName=@col2, Latitude=@col3, Longitude=@col4, Postal=@col5, Contact=@col6, Closing=@col7;

SELECT * FROM `outlets`;

SELECT DISTANCE( 37.7756, -122.4193, 40.71448, -74.00598, 'KM' );

SELECT DISTANCE( 1.3104680812609208, 103.86246226812166, 1.327351,103.678836, 'KM' );

SELECT *, DISTANCE(1.3104680812609208, 103.86246226812166, Latitude, Longitude, 'KM' ) AS `distance` 
FROM `outlets`
ORDER BY `distance` ASC;
